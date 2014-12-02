function Operator(frequency, index) {
	this.phaseStep = PERIOD * frequency/SAMPLE_RATE; // radians per sample
	this.index = index;
	this.phase = 0;

	this.indexEnv = new Envelope(0, 1, 0.1, 0.2);
	this.indexMax = 20;
	this.indexMin = 1;
}

Operator.prototype.render = function(mod) {
	mod = mod || 0;
	var index = this.indexMin + this.indexEnv.render() * (this.indexMax - this.indexMin);
	var value = Math.sin(this.phase + mod * index);
	this.phase += this.phaseStep;
	if (this.phase >= PERIOD) {
		this.phase -= PERIOD;
	}
	return value;
}

Operator.prototype.noteOff = function() {
	this.indexEnv.noteOff();
}