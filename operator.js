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
