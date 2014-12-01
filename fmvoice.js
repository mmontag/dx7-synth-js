function FMVoice(frequency, velocity) {
	this.ampEnv = new Envelope(0, 0.1, 0.4, 0.1);
	
	// For operator 2
	// TODO: move this into Operator class
	this.indexEnv = new Envelope(0, 1, 0.1, 0.2);
	this.indexMax = 20;
	this.indexMin = 1;

	this.frequency = frequency;
	this.velocity = velocity;
	this.op1 = new Operator(frequency, 0);
	this.op2 = new Operator(frequency/4, this.indexMin);
	// this.op3 = new Operator(MOD2, IDX2);
}

FMVoice.prototype.render = function() {
	var ampEnv = this.ampEnv.render();
	return this.velocity * ampEnv *
			this.op1.render(
				this.op2.render(
					// this.op3.render(), this.op3.index
				),
				this.indexMin + this.indexEnv.render() * (this.indexMax - this.indexMin)
			);
}

FMVoice.prototype.noteOff = function() {
	this.ampEnv.noteOff();
	this.indexEnv.noteOff();
}
