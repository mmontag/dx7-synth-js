var SAMPLE_RATE = 44100;
var PERIOD = Math.PI * 2;
var MAX_SIDEBANDS = 20; // should be even. Total bands will be max sidebands + 1

var synth = new Synth(SidebandVoice);
var midi = new MIDI(synth);

var ctx = new (window.AudioContext || window.webkitAudioContext)();
var osc = ctx.createOscillator();
var gain = ctx.createGain();
var proc = ctx.createScriptProcessor(1024, 1, 1);

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
			// chOut[sample] = Math.round((Math.random() * 2 - 1)) * 0.2;
			// chOut[sample] = 0.15 * voice1.render();
			// chOut[sample] = 0.15 * voice1.render();
			chOut[sample] = 0.5 * synth.render();
		}
	}
}





//------ bessel stuff -------
// https://code.google.com/p/webkit-mirror/source/browse/Source/WebCore/platform/audio/AudioUtilities.cpp?r=5b585ab6ad799c8ed35ec7c27cbf78a7d83494e4#36

var CARRIER = 200;
var MOD = 200;
var IDX = 4;
var MOD2 = 200;
var IDX2 = 1;

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





ENV_ATTACK = 0;
ENV_DECAY = 1;
ENV_SUSTAIN = 2;
ENV_RELEASE = 3;
ENV_OFF = 4;

function Envelope(attackTime, decayTime, sustainLevel, releaseTime) {
	this.state = ENV_ATTACK;
	if (sustainLevel > 1 || sustainLevel < 0) throw Error("sustainLevel must be between 0 and 1");
	if (attackTime < 0) throw Error("attackTime must be positive");
	if (decayTime < 0) throw Error("decayTime must be positive");
	if (releaseTime < 0) throw Error("releaseTime must be positive");
	this.attackIncrement = 1 / (attackTime * SAMPLE_RATE);
	this.decayIncrement = (1 - sustainLevel) / (decayTime * SAMPLE_RATE);
	this.sustainLevel = sustainLevel;
	this.releaseIncrement = sustainLevel / (releaseTime * SAMPLE_RATE);
	this.val = 0;
}

Envelope.prototype.render = function() {
	switch (this.state) {
		case ENV_ATTACK:
			this.val += this.attackIncrement;
			if (this.val >= 1.0) {
				this.val = 1.0;
				this.state = ENV_DECAY;
			}
			break;
		case ENV_DECAY:
			this.val -= this.decayIncrement;
			if (this.val < this.sustainLevel) {
				this.val = this.sustainLevel;
				this.state = ENV_SUSTAIN;
			}
			break;
		case ENV_SUSTAIN:
			break;
		case ENV_RELEASE:
			this.val -= this.releaseIncrement;
			if (this.val <= 0.0) {
				this.val = 0;
				this.state = ENV_OFF;
			}
			break;
	}
	return this.val;
}

Envelope.prototype.noteOff = function() {
	this.state = ENV_RELEASE;
}



function Operator(frequency, index) {
	this.phaseStep = PERIOD * frequency/SAMPLE_RATE; // radians per sample
	this.index = index;
	this.phase = 0;
	//this.envelope = new Envelope();
}

Operator.prototype.render = function(mod, index) {
	mod = mod || 0;
	index = index || 0;
	var value = Math.sin(this.phase + mod * index);
	this.phase += this.phaseStep;
	if (this.phase >= PERIOD) {
		this.phase -= PERIOD;
	}
	return value;
}





function Voice(frequency, velocity) {
	this.ampEnv = new Envelope(0, 0.1, 0.4, 0.1);
	
	// For operator 2
	this.indexEnv = new Envelope(0.02, 1, 0.1, 0.2);
	this.indexMax = 30;
	this.indexMin = 1;

	this.frequency = frequency;
	this.velocity = velocity;
	this.op1 = new Operator(frequency, 0);
	this.op2 = new Operator(frequency/5, this.indexMin);
	// this.op3 = new Operator(MOD2, IDX2);
}

Voice.prototype.render = function() {
	var ampEnv = this.ampEnv.render();
	return this.velocity * ampEnv *
			this.op1.render(
				this.op2.render(
					// this.op3.render(), this.op3.index
				),
				this.indexMin + this.indexEnv.render() * (this.indexMax - this.indexMin)
			);
}

Voice.prototype.noteOff = function() {
	this.ampEnv.noteOff();
	this.indexEnv.noteOff();
}




function SidebandVoice(frequency, velocity) {
	this.ampEnv = new Envelope(0.002, 0.1, 0.4, 0.1);
	this.sidebands = this.initSidebands();

	// For operator 2
	this.indexEnv = new Envelope(0.02, 1, 0.1, 0.2);
	this.indexMax = 5;
	this.indexMin = 1;

	this.frequency = frequency;
	this.velocity = velocity;

	this.updateInterval = 1024;
	this.updateCounter = 0;
}

SidebandVoice.prototype.initSidebands = function() {
	var sidebands = [];
	for (var i = 0; i < MAX_SIDEBANDS + 1; i++) {
		sidebands.push({
			freq: 0,
			phase: Math.random() * PERIOD,
			amp: 0
		});
	}
	return sidebands;
}

SidebandVoice.prototype.updateSidebands = function(sidebands, carrier, mod, index) {
	var centerIdx = MAX_SIDEBANDS / 2;
	// Carson's Rule
	for (var order = 0; order <= index + 3 && order < MAX_SIDEBANDS / 2; order++) {
		var amp = besselj(index, order);

		var upperIdx = centerIdx + order;
		sidebands[upperIdx].freq = carrier + mod * order;
		sidebands[upperIdx].amp = sidebands[upperIdx].freq > SAMPLE_RATE/2 ? 0 : amp;

		var lowerIdx = centerIdx - order;
		sidebands[lowerIdx].freq = Math.pow(-1, order) * carrier - mod * order; // TODO: double check this
		sidebands[lowerIdx].amp = Math.abs(sidebands[lowerIdx].freq) > SAMPLE_RATE/2 ? 0 : amp;
	}
	return sidebands;
}


SidebandVoice.prototype.update = function() {
	var index = this.indexMin + this.indexEnv.val * (this.indexMax - this.indexMin);
	this.sidebands = this.updateSidebands(this.sidebands, this.frequency, this.frequency/5, index);
}

SidebandVoice.prototype.render = function() {
	this.indexEnv.render(); // just update the value.
	if (this.updateCounter++ % this.updateInterval == 0) {
		this.update();
	}

	var val = 0;
	for (var i = 0; i < this.sidebands.length; i++) {
		var band = this.sidebands[i];
		if (band && band.amp) {
			val += band.amp * Math.sin(band.phase);
			band.phase += PERIOD * parseInt(band.freq)/SAMPLE_RATE;
			if (band.phase >= PERIOD) band.phase -= PERIOD;
		}
	}
	return this.velocity * this.ampEnv.render() * val;
}

SidebandVoice.prototype.noteOff = function() {
	this.ampEnv.noteOff();
	this.indexEnv.noteOff();
}


