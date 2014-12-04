function FMVoice(frequency, velocity) {
	this.frequency = frequency;
	this.velocity = velocity;
	this.op1 = new Operator(frequency);
	this.op2 = new Operator(frequency*11);
	this.op3 = new Operator(frequency);
	this.op4 = new Operator(frequency);
}

FMVoice.prototype.render = function() {
	return this.velocity * (
			this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render())
		);
}

FMVoice.prototype.noteOff = function() {
	this.op1.noteOff();
	this.op2.noteOff();
	this.op3.noteOff();
	this.op4.noteOff();
}
