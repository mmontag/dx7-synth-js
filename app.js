var PARAMS = PARAMS || {};
var SAMPLE_RATE = 44100;
var PERIOD = Math.PI * 2;

(function(SpectrumBox, MIDI, SysexDX7, FMVoice) {
	var app = angular.module('synthApp', ['ngStorage']);
	var synth = new Synth(FMVoice);
	var midi = new MIDI(synth);
	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	var scriptProcessor = audioContext.createScriptProcessor(1024, 0, 2);

	scriptProcessor.connect(audioContext.destination);
	scriptProcessor.onaudioprocess = function(e) {
		var buffer = e.outputBuffer;
		var outputL = buffer.getChannelData(0);
		var outputR = buffer.getChannelData(1);
		for (var i = 0, length = buffer.length; i < length; i++) {
			var output = synth.render();
			outputL[i] = output[0];
			outputR[i] = output[1];
		}
	};

	// Setup frequency domain graph
	var frequencybox = new SpectrumBox(2048, 2048, "fftbox", audioContext);
	frequencybox.foreground = "rgb(50, 50, 50)";
	frequencybox.background = "rgb(240, 240, 240)";
	scriptProcessor.connect(frequencybox.getAudioNode());

	// Setup time domain graph
	var wavebox = new SpectrumBox(2048, 1024, "wavebox", audioContext);
	wavebox.setType(SpectrumBox.Types.TIME);
	wavebox.foreground = "rgb(50, 50, 50)";
	wavebox.background = "rgb(220, 220, 220)";
	scriptProcessor.connect(wavebox.getAudioNode());


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

	app.controller('MidiCtrl', function($scope) {
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
			if (mml && mml._ended == 0) {
				mml.stop();
				synth.panic();
				mml = null;
			} else {
				mml = this.createMML(idx);
				mml.start();
			}
		};

		this.onAnalysisChange = function() {
			if (this.showAnalysis) {
				frequencybox.enable();
				wavebox.enable();
			} else {
				frequencybox.disable();
				wavebox.disable();
			}
		};

		this.onKeyDown = function(ev) {
			var note = qwertyNotes[ev.keyCode];
			if (ev.keyCode == 32) {
				synth.panic(); return false;
			}
			if (ev.repeat) return false;
			if (note)
				synth.noteOn(note, 0.75);
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
	});

	app.controller('PresetCtrl', ['$localStorage', '$http', function ($localStorage, $http) {
		this.lfoWaveformOptions = [ 'Triangle', 'Saw Down', 'Saw Up', 'Square', 'Sine', 'Sample & Hold' ];
		var self = this;
		$http.get('roms/ROM1A.SYX')
			.success(function(data) {
				self.basePresets = SysexDX7.loadBank(data);
				self.$storage = $localStorage;
				self.presets = [];
				for (var i = 0; i < self.basePresets.length; i++) {
					if (self.$storage[i]) {
						self.presets[i] = angular.copy(self.$storage[i]);
					} else {
						self.presets[i] = angular.copy(self.basePresets[i]);
					}
					// Defaults for non-standard parameters
					for (var j = 0; j < 6; j++) {
						self.presets[i].operators[j].pan = self.presets[i].operators[j].pan || 0;
					}
				}
				self.selectedIndex = 2;
				self.onChange();
			});

		this.onChange = function() {
			console.log("changed preset!", this.selectedIndex);
			PARAMS = this.presets[this.selectedIndex];
			// TODO: separate UI parameters from internal synth parameters
			// TODO: better initialization of computed parameters
			for (var i = 0; i < PARAMS.operators.length; i++) {
				var op = PARAMS.operators[i];
				this.onVolumeChange(i, op);
				this.onUpdateFrequency(i);
				this.onPanChange(i, op.pan);
			}
			this.onFeedbackChange();
		};

		this.save = function() {
			this.$storage[this.selectedIndex] = angular.copy(this.presets[this.selectedIndex]);
			console.log("Saved preset %s.", this.presets[this.selectedIndex].name);
		};

		this.reset = function() {
			if (confirm('Are you sure you want to reset this patch?')) {
				delete this.$storage[this.selectedIndex];
				console.log("Reset preset %s.", this.presets[this.selectedIndex].name);
				this.presets[this.selectedIndex] = angular.copy(self.basePresets[this.selectedIndex]);
				this.onChange();
			}
		};

		this.onUpdateFrequency = function(operatorIndex) {
			FMVoice.updateFrequency(operatorIndex);
		};

		this.onVolumeChange = function(operatorIndex, operator) {
			FMVoice.setOutputLevel(operatorIndex, operator.volume);
			console.log("outputLevel changed", operator.outputLevel);
		};

		this.onFeedbackChange = function() {
			FMVoice.setFeedback(PARAMS.feedback);
			console.log("fbRatio changed", PARAMS.fbRatio);
		};

		this.onLFOChange = function() {};

		this.onPanChange = function(operatorIndex, value) {
			FMVoice.setPan(operatorIndex, value);
			console.log("pan changed", this.getOp(operatorIndex).outputLevelL, this.getOp(operatorIndex).outputLevelR);
		};

		this.getOp = function(operatorIndex) {
			return this.presets[this.selectedIndex].operators[operatorIndex];
		};
	}]);
})(SpectrumBox, MIDI, SysexDX7, FMVoice);
