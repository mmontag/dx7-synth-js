var config = require('./config');

// http://www.chipple.net/dx7/fig09-4.gif
var OCTAVE_1024 = 1.0006771307; //Math.exp(Math.log(2)/1024);
var PERIOD = Math.PI * 2;

function Operator(params, baseFrequency, envelope, lfo) {
	this.phase = 0;
	this.val = 0;
	this.params = params;
	this.envelope = envelope;
	// TODO: Pitch envelope
	// this.pitchEnvelope = pitchEnvelope;
	this.lfo = lfo;
	this.updateFrequency(baseFrequency);
}

Operator.prototype.updateFrequency = function(baseFrequency) {
	var frequency = this.params.oscMode ?
		this.params.freqFixed :
		baseFrequency * this.params.freqRatio * Math.pow(OCTAVE_1024, this.params.detune);
	this.phaseStep = PERIOD * frequency / config.sampleRate; // radians per sample
};

Operator.prototype.render = function(mod) {
	this.val = Math.sin(this.phase + mod) * this.envelope.render() * this.lfo.renderAmp();
//	this.phase += this.phaseStep * this.pitchEnvelope.render() * this.lfo.render();
	this.phase += this.phaseStep * this.lfo.render();
	if (this.phase >= PERIOD) {
		this.phase -= PERIOD;
	}
	return this.val;
};

Operator.prototype.noteOff = function() {
	this.envelope.noteOff();
};

Operator.prototype.isFinished = function() {
	return this.envelope.isFinished();
};

module.exports = Operator;
