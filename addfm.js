var SAMPLE_RATE = 44100;
var PERIOD = Math.PI * 2;
var MAX_SIDEBANDS = 50; // should be even. Total bands will be max sidebands + 1
var ANTI_ALIAS = true;

var synth = new Synth(FMVoice);
var synth = new Synth(AdditiveFMVoice);
var midi = new MIDI(synth);

var ctx = new (window.AudioContext || window.webkitAudioContext)();
var osc = ctx.createOscillator();
var gain = ctx.createGain();
var proc = ctx.createScriptProcessor(512, 1, 1);

proc.connect(gain);

gain.connect(ctx.destination);

// Setup frequency domain graph
var frequencybox = new SpectrumBox(2048, 2048, "fftbox", ctx);
frequencybox.foreground = "rgb(50, 50, 50)";
frequencybox.background = "rgb(240, 240, 240)";
proc.connect(frequencybox.getAudioNode());
// Setup time domain graph
var wavebox = new SpectrumBox(2048, 1024, "wavebox", ctx);
wavebox.setType(SpectrumBox.Types.TIME);
wavebox.foreground = "rgb(50, 50, 50)";
wavebox.background = "rgb(220, 220, 220)";
proc.connect(wavebox.getAudioNode());

$('#analysis').on('click', function(){
	if ($(this).is(':checked')) {
		frequencybox.enable();
		wavebox.enable();
	} else {
		frequencybox.disable();
		wavebox.disable();
	}
});

frequencybox.enable();
wavebox.enable();

proc.onaudioprocess = function(e) {
	var output = e.outputBuffer;
	for (var channel = 0; channel < output.numberOfChannels; channel++) {
		var chOut = output.getChannelData(channel);
		for (var sample = 0, length = output.length; sample < length; sample++) {
			chOut[sample] = 0.5 * (synth.render());
		}
	}
}





//------ bessel stuff -------
// https://code.google.com/p/webkit-mirror/source/browse/Source/WebCore/platform/audio/AudioUtilities.cpp?r=5b585ab6ad799c8ed35ec7c27cbf78a7d83494e4#36

function plotSidebands(bands) {
	// 	// Flatten sidebands
	// for (sideband in sidebands) {
	// 	sidebands[sideband] = Math.abs(sidebands[sideband]);
	// }

	var sidebandCanvas = document.getElementById('sidebands');
	var sidebandCtx = sidebandCanvas.getContext('2d');
	var xscale = sidebandCanvas.width / (SAMPLE_RATE/2);
	var bands = sidebands(CARRIER, MOD, IDX);
	sidebandCtx.fillStyle = "rgb(230,230,230)";
	sidebandCtx.fillRect(0, 0, sidebandCanvas.width, sidebandCanvas.height);
	sidebandCtx.fillStyle = "rgb(200,0,0)";
	for (var band in bands) {
		sidebandCtx.fillRect(band * xscale, sidebandCanvas.height, 1, -bands[band] * sidebandCanvas.height);
	}
}

//------ end  bessels -------

















function AdditiveFMVoice(frequency, velocity) {
	this.ampEnv = new Envelope(0, 0.1, 0.4, 0.1);
	// For operator 2
	this.indexEnv = new Envelope(0, 1, 0.1, 0.2);
	this.indexMax = 20;
	this.indexMin = 1;

	this.frequency = frequency;
	this.velocity = velocity;

	// Hacky sideband initial state setup
	this.sidebands = this.initSidebands();
	this.indexEnv.render();
	this.update();
	for (var i = 0; i < this.sidebands.length; i++) {
		var band = this.sidebands[i];
		band.amp = band.ampTo;
	}

	this.updateInterval = 128;
	this.updateIntervalInverse = 1 / this.updateInterval;
	this.updateCounter = 0;
}

AdditiveFMVoice.prototype.initSidebands = function() {
	var sidebands = [];
	for (var i = 0; i < MAX_SIDEBANDS + 1; i++) {
		sidebands.push({
			freq: 0,
			phase: PERIOD / (i + 1),
			amp: 0,
			ampTo: 0
		});
	}
	return sidebands;
}

AdditiveFMVoice.prototype.updateSidebands = function(sidebands, carrier, mod, index) {
	var centerIdx = MAX_SIDEBANDS / 2;
	// Carson's Rule
	for (var order = 0; order < MAX_SIDEBANDS / 2; order++) {
		var amp = besselj(index, order);

		var upperIdx = centerIdx + order;
		sidebands[upperIdx].freq = carrier + mod * order;
		sidebands[upperIdx].amp = sidebands[upperIdx].ampTo;
		sidebands[upperIdx].ampTo = ANTI_ALIAS ? (sidebands[upperIdx].freq > SAMPLE_RATE/2 ? 0 : amp) : amp;

		var lowerIdx = centerIdx - order;
		sidebands[lowerIdx].freq = carrier - mod * order; // TODO: double check this
		sidebands[lowerIdx].amp = sidebands[lowerIdx].ampTo;
		sidebands[lowerIdx].ampTo = ANTI_ALIAS ? Math.pow(-1, order) * (Math.abs(sidebands[lowerIdx].freq) > SAMPLE_RATE/2 ? 0 : amp) : amp;
	}
	return sidebands;
}


AdditiveFMVoice.prototype.update = function() {
	var index = this.indexMin + this.indexEnv.val * (this.indexMax - this.indexMin);
	this.sidebands = this.updateSidebands(this.sidebands, this.frequency, this.frequency/4, index);
}

AdditiveFMVoice.prototype.render = function() {
	this.indexEnv.render(); // just update the value.
	if (this.updateCounter++ == this.updateInterval) {
		this.update();
		this.updateCounter = 0;
	}

	var val = 0;
	var updateRemaining = this.updateInterval - this.updateCounter;
	for (var i = 0; i < this.sidebands.length; i++) {
		var band = this.sidebands[i];
		// update sideband amplitude if necessary
		if (band && band.freq != 0) {
			var amp = (band.amp * updateRemaining + band.ampTo * this.updateCounter) * this.updateIntervalInverse;
			val += amp * Math.sin(band.phase);
			band.phase += PERIOD * band.freq/SAMPLE_RATE;
			if (band.phase >= PERIOD) band.phase -= PERIOD;
			else if (band.phase <= PERIOD) band.phase += PERIOD;
		}
	}
	return this.velocity * this.ampEnv.render() * val;
}

AdditiveFMVoice.prototype.noteOff = function() {
	this.ampEnv.noteOff();
	this.indexEnv.noteOff();
}


