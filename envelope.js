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
