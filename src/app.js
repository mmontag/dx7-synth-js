var _ = require('lodash');
var Angular = require('angular');
var ngStorage = require('ngstorage');
var MMLEmitter = require('mml-emitter');
var MIDIFile = require('midifile');
var MIDIPlayer = require('midiplayer');
var axios = require('axios').default;

var FMVoice = require('./voice-dx7');
var MIDI = require('./midi');
var Synth = require('./synth');
var SysexDX7 = require('./sysex-dx7');
var Visualizer = require('./visualizer');
var Reverb = require('./reverb');

var config = require('./config');
var defaultPresets = require('./default-presets');

var PARAM_START_MANIPULATION = 'param-start-manipulation';
var PARAM_STOP_MANIPULATION = 'param-stop-manipulation';
var PARAM_CHANGE = 'param-change';
var DEFAULT_PARAM_TEXT = '--';

var app = Angular.module('synthApp', ['ngStorage']);
var synth = new Synth(FMVoice, config.polyphony);
var midi = new MIDI(synth);
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
config.sampleRate = audioContext.sampleRate;
var visualizer = new Visualizer("analysis", 256, 35, 0xc0cf35, 0x2f3409, audioContext);
var scriptProcessor = null;
var reverbGainNode = null;

function setupAudioGraph() {
	Reverb.extend(audioContext);
	var reverbNode = audioContext.createReverbFromUrl("impulses/church-saint-laurentius.wav");
	reverbGainNode = audioContext.createGain();
	reverbNode.connect(reverbGainNode);

	scriptProcessor = audioContext.createScriptProcessor(config.bufferSize, 0, 2);
	scriptProcessor.connect(visualizer.getAudioNode());
	scriptProcessor.connect(reverbNode);

	scriptProcessor.connect(audioContext.destination);
	reverbGainNode.connect(audioContext.destination);

	var bufferSize = scriptProcessor.bufferSize || config.bufferSize;
	var bufferSizeMs = 1000 * bufferSize / config.sampleRate;
	var msPerSample = 1000 / config.sampleRate;
	// Attach to window to avoid GC. http://sriku.org/blog/2013/01/30/taming-the-scriptprocessornode
	scriptProcessor.onaudioprocess = window.audioProcess = function (e) {
		var buffer = e.outputBuffer;
		var outputL = buffer.getChannelData(0);
		var outputR = buffer.getChannelData(1);

		var sampleTime = performance.now() - bufferSizeMs;
		var visualizerFrequency = FMVoice.frequencyFromNoteNumber(synth.getLatestNoteDown());
		visualizer.setPeriod(config.sampleRate / visualizerFrequency);

		for (var i = 0, length = buffer.length; i < length; i++) {
			sampleTime += msPerSample;
			synth.processQueuedEventsUpToSampleTime(sampleTime);
			var output = synth.render();
			outputL[i] = output[0];
			outputR[i] = output[1];
		}
	};
}

setupAudioGraph();

// Polyphony counter
setInterval(function() {
	var count = 0;
	synth.voices.map(function(voice) { if (voice) count++; });
	if (count) console.log("Current polyphony:", count);
}, 1000);

app.directive('toNumber', function() {
	return {
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			ctrl.$parsers.push(function (value) {
				return parseFloat(value || '');
			});
		}
	};
});

app.filter('reverse', function() {
	return function(items) {
		return items ? items.slice().reverse() : items;
	};
});

app.directive('toggleButton', function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		require: 'ngModel',
		scope: {'ngModel': '='},
		template: '<button type="button" class="dx7-toggle ng-class:{\'dx7-toggle-on\':ngModel}" data-toggle="button" ng-click="ngModel = 1 - ngModel" ng-transclude></button>'
	};
});

app.directive('knob', function() {
	function link(scope, element, attrs) {
		var rotationRange = 300; // ±degrees
		var pixelRange = 200; // pixels between max and min
		var startY, startModel, down = false;
		var fgEl = element.find('div');
		var max = element.attr('max');
		var min = element.attr('min');
		var increment = (max - min) < 99 ? 1 : 2;
		element.on('mousedown', function(e) {
			startY = e.clientY;
			startModel = scope.ngModel || 0;
			down = true;
			e.preventDefault();
			e.stopPropagation();
			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
			element[0].querySelector('.knob').focus();
			scope.$emit(PARAM_START_MANIPULATION, scope.ngModel);
		});

		element.on('touchstart', function(e) {
			if (e.touches.length > 1) {
				// Don't interfere with any multitouch gestures
				onUp(e);
				return;
			}

			startY = e.targetTouches[0].clientY;
			startModel = scope.ngModel || 0;
			down = true;
			e.preventDefault();
			e.stopPropagation();
			window.addEventListener('touchmove', onMove);
			window.addEventListener('touchend', onUp);
			element[0].querySelector('.knob').focus();
			scope.$emit(PARAM_START_MANIPULATION, scope.ngModel);
		});

		element.on('keydown', function(e) {
			var code = e.keyCode;
			if (code >= 37 && code <= 40) {
				e.preventDefault();
				e.stopPropagation();
				if (code == 38 || code == 39) {
					scope.ngModel = Math.min(scope.ngModel + 1, max);
				} else {
					scope.ngModel = Math.max(scope.ngModel - 1, min);
				}
				apply();
			}
		});

		element.on('wheel', function(e) {
			e.preventDefault();
			element[0].focus();
			if (e.deltaY > 0) {
				scope.ngModel = Math.max(scope.ngModel - increment, min);
			} else {
				scope.ngModel = Math.min(scope.ngModel + increment, max);
			}
			apply();
		});

		function onMove(e) {
			if (down) {
				var clientY = e.clientY;
				if (e.targetTouches && e.targetTouches[0])
					clientY = e.targetTouches[0].clientY;
				var dy = (startY - clientY) * (max - min) / pixelRange;
				// TODO: use 'step' attribute
				scope.ngModel = Math.round(Math.max(min, Math.min(max, dy + startModel)));
				apply();
			}
		}

		function onUp(e) {
			down = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onUp);
			scope.$emit(PARAM_STOP_MANIPULATION, scope.ngModel);
		}

		var apply = _.throttle(function () {
			scope.$emit(PARAM_CHANGE, scope.label + ": " + scope.ngModel);
			scope.$apply();
		}, 33);

		scope.getDegrees = function() {
			return (this.ngModel - min) / (max - min) * rotationRange - (rotationRange / 2) ;
		}
	}

	return {
		restrict: 'E',
		replace: true,
		require: 'ngModel',
		scope: {ngModel: '=', label: '@'},
		template: '<div><div class="param-label">{{ label }}</div><div class="knob" tabindex="0"><div class="knob-foreground" ng-style="{\'transform\': \'rotate(\' + getDegrees() + \'deg)\'}"></div></div></div>',
		link: link
	};
});

app.directive('slider', function() {
	function link(scope, element, attrs) {
		var sliderHandleHeight = 8;
		var sliderRailHeight = 50;
		var positionRange = sliderRailHeight - sliderHandleHeight;
		var pixelRange = 50;
		var startY, startModel, down = false;
		var max = element.attr('max');
		var min = element.attr('min');
		var increment = (max - min) < 99 ? 1 : 2;
		element.on('mousedown', function(e) {
			startY = e.clientY;
			startModel = scope.ngModel || 0;
			down = true;
			e.preventDefault();
			e.stopPropagation();
			window.addEventListener('mousemove', onMove);
			window.addEventListener('mouseup', onUp);
			element[0].querySelector('.slider').focus();
			scope.$emit(PARAM_START_MANIPULATION, scope.ngModel);
		});

		element.on('touchstart', function(e) {
			if (e.touches.length > 1) {
				// Don't interfere with any multitouch gestures
				onUp(e);
				return;
			}

			startY = e.targetTouches[0].clientY;
			startModel = scope.ngModel || 0;
			down = true;
			e.preventDefault();
			e.stopPropagation();
			window.addEventListener('touchmove', onMove);
			window.addEventListener('touchend', onUp);
			element[0].querySelector('.slider').focus();
			scope.$emit(PARAM_START_MANIPULATION, scope.ngModel);
		});

		element.on('keydown', function(e) {
			var code = e.keyCode;
			if (code >= 37 && code <= 40) {
				e.preventDefault();
				e.stopPropagation();
				if (code === 38 || code === 39) {
					scope.ngModel = Math.min(scope.ngModel + 1, max);
				} else {
					scope.ngModel = Math.max(scope.ngModel - 1, min);
				}
				apply();
			}
		});

		element.on('wheel', function(e) {
			e.preventDefault();
			element[0].querySelector('.slider').focus();
			if (e.deltaY > 0) {
				scope.ngModel = Math.max(scope.ngModel - increment, min);
			} else {
				scope.ngModel = Math.min(scope.ngModel + increment, max);
			}
			apply();
		});

		function onMove(e) {
			if (down) {
				var clientY = e.clientY;
				if (e.targetTouches && e.targetTouches[0])
					clientY = e.targetTouches[0].clientY;
				var dy = (startY - clientY) * (max - min) / pixelRange;
				scope.ngModel = Math.round(Math.max(min, Math.min(max, dy + startModel)));
				apply();
			}
		}

		function onUp(e) {
			down = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
			window.removeEventListener('touchmove', onMove);
			window.removeEventListener('touchend', onUp);
			scope.$emit(PARAM_STOP_MANIPULATION, scope.ngModel);
		}

		var apply = _.throttle(function() {
			scope.$emit(PARAM_CHANGE, scope.label + ": " + scope.ngModel);
			scope.$apply();
		}, 33);

		scope.getTop = function() {
			return positionRange - ((this.ngModel - min) / (max - min) * positionRange);
		}
	}

	return {
		restrict: 'E',
		replace: true,
		require: 'ngModel',
		scope: {ngModel: '=', label: '@'},
		template: '<div><div class="slider" tabindex="0"><div class="slider-foreground" ng-style="{\'top\': getTop() + \'px\'}"></div></div><div class="slider-meter"></div></div>',
		link: link
	};
});

app.controller('MidiCtrl', ['$scope', function($scope) {
	// MIDI stuff
	var self = this;
	this.midiFileIndex = 0;
	this.midiFiles = [
		"midi/rachmaninoff-op39-no6.mid",
		"midi/minute_waltz.mid",
		"midi/bluebossa.mid",
		"midi/cantaloup.mid",
		"midi/chameleon.mid",
		"midi/tunisia.mid",
		"midi/sowhat.mid",
		"midi/got-a-match.mid"
	];
	this.midiPlayer = new MIDIPlayer({
		output: {
			// Loopback MIDI to input handler.
			send: function(data, timestamp) {
				// Synthetic MIDIMessageEvent
				midi.send({ data: data, timeStamp: timestamp });
			}
		}
	});

	this.onMidiPlay = function() {
		axios.get(this.midiFiles[this.midiFileIndex], {responseType: "arraybuffer"})
			.then(function(response) {
				const data = response.data;
				console.log("Loaded %d bytes.", data.byteLength);
				var midiFile = new MIDIFile(data);
				self.midiPlayer.load(midiFile);
				self.midiPlayer.play(function() { console.log("MIDI file playback ended."); });
			});
	};

	this.onMidiStop = function() {
		this.midiPlayer.stop();
		synth.panic();
	};

	var mml = null;
	var mmlDemos = [ "t92 l8 o4 $" +
		"[>cg<cea]2.        [>cg<ceg]4" +
		"[>>a<a<c+fa+]2.    [>>a <a <c+ e a]4" +
		"[>>f <f g+ <c g]2. [>>f <f g+ <c f]4" +
		"[>>g <g g+ b <g+]2.[>>g <g <g]4;" +
		"t92 $ l1 o3 v12 r r r r2 r8 l32 v6 cdef v8 ga v10 b<c v12 de v14 fg;",
		"t120$ l8 o3    >g+2.. g+ a+4. a+ <c2 >a+    g+2.. a+4 a+4 <c4. >d+" +
			"              a+ g+2. g+ a+4. a+ <c2 >a+   g+2.. a+4 a+4 <c2.;" +
			"t120$l8 o4    rr g g4 g+ a+4 d4 d4 d+2     d c g g4 g+ a+4 d4 d4 d+2" +
			"              rr g g4 g+ a+4 d4 d4 d+2     d c g g4 g+ a+4 d4 d4 d+2.;" +
			"t120$l8 o4 v9 rr d+ d+2 r >a+4 a+4 <c2     >a+ g+ <d+ d+2 r >a+4 a+4 a+2" +
			"              rr d+ d+2 r >a+4 a+4 <c2     >a+ g+ <d+ d+2 r >a+4 a+4 a+2.;" +
			"t120$l8 o4 v8 rr c c2 r   >f4 f4 g2        a+ g+ <c c2 >f f4 r f g2<" +
			"              rr c c2 r   >f4 f4 g2        a+ g+ <c c2 >f f4 r f g2.<;"
	];
	var qwertyNotes = [];
	//Lower row: zsxdcvgbhnjm...
	qwertyNotes[16] = 41; // = F2
	qwertyNotes[65] = 42;
	qwertyNotes[90] = 43;
	qwertyNotes[83] = 44;
	qwertyNotes[88] = 45;
	qwertyNotes[68] = 46;
	qwertyNotes[67] = 47;
	qwertyNotes[86] = 48; // = C3
	qwertyNotes[71] = 49;
	qwertyNotes[66] = 50;
	qwertyNotes[72] = 51;
	qwertyNotes[78] = 52;
	qwertyNotes[77] = 53; // = F3
	qwertyNotes[75] = 54;
	qwertyNotes[188] = 55;
	qwertyNotes[76] = 56;
	qwertyNotes[190] = 57;
	qwertyNotes[186] = 58;
	qwertyNotes[191] = 59;

	// Upper row: q2w3er5t6y7u...
	qwertyNotes[81] = 60; // = C4 ("middle C")
	qwertyNotes[50] = 61;
	qwertyNotes[87] = 62;
	qwertyNotes[51] = 63;
	qwertyNotes[69] = 64;
	qwertyNotes[82] = 65; // = F4
	qwertyNotes[53] = 66;
	qwertyNotes[84] = 67;
	qwertyNotes[54] = 68;
	qwertyNotes[89] = 69;
	qwertyNotes[55] = 70;
	qwertyNotes[85] = 71;
	qwertyNotes[73] = 72; // = C5
	qwertyNotes[57] = 73;
	qwertyNotes[79] = 74;
	qwertyNotes[48] = 75;
	qwertyNotes[80] = 76;
	qwertyNotes[219] = 77; // = F5
	qwertyNotes[187] = 78;
	qwertyNotes[221] = 79;
	qwertyNotes[220] = 80;

	this.createMML = function (idx) {
		var mml = new MMLEmitter(audioContext, mmlDemos[idx]);
		var noteHandler = function(e) {
			synth.noteOn(e.midi, e.volume / 20);
			e.noteOff(function() {
				synth.noteOff(e.midi);
			});
		};
		mml.tracks.map(function(track) { track.on('note', noteHandler); });
		return mml;
	};

	this.onDemoClick = function(idx) {
		if (mml && mml._ended === 0) {
			mml.stop();
			synth.panic();
			mml = null;
		} else {
			mml = this.createMML(idx);
			mml.start();
		}
	};

	this.onVizClick = function() {
		visualizer.cycleMode();
	};

	this.onKeyDown = function(ev) {
		var note = qwertyNotes[ev.keyCode];
		if (ev.metaKey) return false;
		if (ev.keyCode === 32) {
			if (mml) { mml.stop(); mml = null; }
			self.midiPlayer.stop();
			synth.panic();
			ev.stopPropagation();
			ev.preventDefault();
			return false;
		}
		if (note) {
			if (!ev.repeat) {
				synth.noteOn(note, 0.8 + (ev.ctrlKey ? 0.47 : 0));
			}
			ev.stopPropagation();
			ev.preventDefault();
		}
		return false;
	};

	this.onKeyUp = function(ev) {
		var note = qwertyNotes[ev.keyCode];
		if (note)
			synth.noteOff(note);
		return false;
	};

	window.addEventListener('keydown', this.onKeyDown, false);
	window.addEventListener('keyup', this.onKeyUp, false);
}]);

app.controller('OperatorCtrl', function($scope) {
	$scope.$watchGroup(['operator.oscMode', 'operator.freqCoarse', 'operator.freqFine', 'operator.detune'], function() {
		FMVoice.updateFrequency($scope.operator.idx);
		$scope.freqDisplay = $scope.operator.oscMode === 0 ?
			parseFloat($scope.operator.freqRatio).toFixed(2).toString() :
			$scope.operator.freqFixed.toString().substr(0,4).replace(/\.$/,'');
	});
	$scope.$watch('operator.volume', function() {
		FMVoice.setOutputLevel($scope.operator.idx, $scope.operator.volume);
	});
	$scope.$watch('operator.pan', function() {
		FMVoice.setPan($scope.operator.idx, $scope.operator.pan);
	});
});

app.controller('PresetCtrl', ['$scope', '$localStorage', function ($scope, $localStorage) {
	var self = this;

	this.lfoWaveformOptions = [ 'Triangle', 'Saw Down', 'Saw Up', 'Square', 'Sine', 'Sample & Hold' ];
	this.presets = defaultPresets;
	this.selectedIndex = 0;
	this.paramDisplayText = DEFAULT_PARAM_TEXT;

	var paramManipulating = false;
	var paramDisplayTimer = null;

	function flashParam(value) {
		self.paramDisplayText = value;
		$scope.$apply();
		clearTimeout(paramDisplayTimer);
		if (!paramManipulating) {
			paramDisplayTimer = setTimeout(function() {
				self.paramDisplayText = DEFAULT_PARAM_TEXT;
				$scope.$apply();
			}, 1500);
		}
	}

	$scope.$on(PARAM_START_MANIPULATION, function(e, value) {
		paramManipulating = true;
		flashParam(value);
	});

	$scope.$on(PARAM_STOP_MANIPULATION, function(e, value) {
		paramManipulating = false;
		flashParam(value);
	});

	$scope.$on(PARAM_CHANGE, function(e, value) {
		flashParam(value);
	});

	axios.get('roms/ROM1A.SYX')
		.then(function(response) {
			var data = response.data;
			self.basePresets = SysexDX7.loadBank(data);
			self.$storage = $localStorage;
			self.presets = [];
			for (var i = 0; i < self.basePresets.length; i++) {
				if (self.$storage[i]) {
					self.presets[i] = Angular.copy(self.$storage[i]);
				} else {
					self.presets[i] = Angular.copy(self.basePresets[i]);
				}
			}
			self.selectedIndex = 10; // Select E.PIANO 1
			self.onChange();
		});

	this.onChange = function() {
		this.params = this.presets[this.selectedIndex];
		FMVoice.setParams(this.params);
		// TODO: separate UI parameters from internal synth parameters
		// TODO: better initialization of computed parameters
		for (var i = 0; i < this.params.operators.length; i++) {
			var op = this.params.operators[i];
			FMVoice.setOutputLevel(i, op.volume);
			FMVoice.updateFrequency(i);
			FMVoice.setPan(i, op.pan);
		}
		FMVoice.setFeedback(this.params.feedback);
	};

	this.save = function() {
		this.$storage[this.selectedIndex] = Angular.copy(this.presets[this.selectedIndex]);
		console.log("Saved preset %s.", this.presets[this.selectedIndex].name);
	};

	this.reset = function() {
		if (confirm('Are you sure you want to reset this patch?')) {
			delete this.$storage[this.selectedIndex];
			console.log("Reset preset %s.", this.presets[this.selectedIndex].name);
			this.presets[this.selectedIndex] = Angular.copy(self.basePresets[this.selectedIndex]);
			this.onChange();
		}
	};

	$scope.$watch('presetCtrl.params.feedback', function(newValue) {
		if (newValue !== undefined) {
			FMVoice.setFeedback(self.params.feedback);
		}
	});

	$scope.$watchGroup([
		'presetCtrl.params.lfoSpeed',
		'presetCtrl.params.lfoDelay',
		'presetCtrl.params.lfoAmpModDepth',
		'presetCtrl.params.lfoPitchModDepth',
		'presetCtrl.params.lfoPitchModSens',
		'presetCtrl.params.lfoWaveform'
	], function() {
		FMVoice.updateLFO();
	});

	$scope.presetCtrl.reverb = 33;
	$scope.$watch('presetCtrl.reverb', (value) => {
		reverbGainNode.gain.value = 4 * value / 100;
	});

	self.onChange();

	// Audio context unlock that should work in both iOS and Chrome
	function unlockAudioContext(context) {
		if (context.state === 'suspended') {
			var events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
			var unlock = function unlock() {
				events.forEach(function (event) {
					document.body.removeEventListener(event, unlock)
				});

				console.log("Resuming audio context...");
				context.resume();
				flashParam("** DX7-JS **");

			};

			events.forEach(function (event) {
				document.body.addEventListener(event, unlock, false)
			});
		}
	}

	unlockAudioContext(audioContext);

}]);
