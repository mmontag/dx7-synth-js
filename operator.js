function Operator(frequency, envelope) {
	this.phase = 0;
	this.phaseStep = PERIOD * frequency/SAMPLE_RATE; // radians per sample
	this.envelope = envelope || new Envelope(0, 3, 0, 0.2);
}

Operator.prototype.render = function(mod) {
	mod = mod || 0;
	var value = Math.sin(this.phase + mod) * this.envelope.render();
	this.phase += this.phaseStep;
	if (this.phase >= PERIOD) {
		this.phase -= PERIOD;
	}
	return value;
}

Operator.prototype.noteOff = function() {
	this.envelope.noteOff();
}