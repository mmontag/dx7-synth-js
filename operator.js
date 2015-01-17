// http://www.chipple.net/dx7/fig09-4.gif
function Operator(frequency, envelope, params) {
	this.phase = 0;
	this.val = 0;
	this.phaseStep = PERIOD * frequency/SAMPLE_RATE; // radians per sample
	this.envelope = envelope;
	this.params = params;
}

Operator.prototype.render = function(mod) {
	if (this.params.outputLevel == 0) return 0;
	mod = mod || 0;
	this.val = Math.sin(this.phase + mod) * this.envelope.render();
	this.phase += this.phaseStep;
	if (this.phase >= PERIOD) {
		this.phase -= PERIOD;
	}
	return this.val * this.params.outputLevel;
};

Operator.prototype.noteOff = function() {
	this.envelope.noteOff();
};

Operator.prototype.isFinished = function() {
	return this.envelope.state == ENV_OFF;
};
