function FMVoice(frequency, velocity) {
	this.frequency = frequency;
	this.velocity = velocity;
	this.ampEnv = new Envelope(0, 0.1, 0.4, 0.1);
	this.op1 = new Operator(frequency);
	this.op2 = new Operator(frequency/4);
}

FMVoice.prototype.render = function() {
	var ampEnv = this.ampEnv.render();
	return this.velocity * ampEnv *
		this.op1.render(this.op2.render());
}

FMVoice.prototype.noteOff = function() {
	this.ampEnv.noteOff();
	this.op1.noteOff();
	this.op2.noteOff();
}
