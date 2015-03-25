// http://www.chipple.net/dx7/fig09-4.gif
function Operator(frequency, envelope, lfo, pitchEnvelope) {
	this.phase = 0;
	this.val = 0;
	this.phaseStep = PERIOD * frequency/SAMPLE_RATE; // radians per sample
	this.envelope = envelope;
//	this.pitchEnvelope = pitchEnvelope;
	this.lfo = lfo;
}

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
