ENV_ATTACK = 0;
ENV_DECAY = 1;
ENV_SUSTAIN = 2;
ENV_RELEASE = 3;
ENV_OFF = 4;

function Envelope(attackTime, decayTime, sustainRatio, releaseTime, min, max) {
	this.min = min || 0;
	this.max = max || 1;
	this.range = this.max - this.min;
	this.val = this.min;
	this.state = ENV_ATTACK;
	if (sustainRatio > 1 || sustainRatio < 0) throw Error("sustainRatio must be between 0 and 1");
	if (attackTime < 0) throw Error("attackTime must be positive");
	if (decayTime < 0) throw Error("decayTime must be positive");
	if (releaseTime < 0) throw Error("releaseTime must be positive");
	this.attackIncrement = this.range / (attackTime * SAMPLE_RATE);
	this.sustainLevel = this.range * sustainRatio + this.min;
	this.decayIncrement = -(this.max - this.sustainLevel) / (decayTime * SAMPLE_RATE);
	this.releaseIncrement = -(this.sustainLevel - this.min) / (releaseTime * SAMPLE_RATE);
}

Envelope.prototype.render = function() {
	switch (this.state) {
		case ENV_ATTACK:
			this.val += this.attackIncrement;
			if (this.val >= this.max) {
				this.val = this.max;
				this.state = ENV_DECAY;
			}
			break;
		case ENV_DECAY:
			this.val += this.decayIncrement;
			if (this.val < this.sustainLevel) {
				this.val = this.sustainLevel;
				this.state = ENV_SUSTAIN;
			}
			break;
		case ENV_SUSTAIN:
			break;
		case ENV_RELEASE:
			this.val += this.releaseIncrement;
			if (this.val <= this.min) {
				this.val = this.min;
				this.state = ENV_OFF;
			}
			break;
	}
	return this.val;
}

Envelope.prototype.noteOff = function() {
	this.state = ENV_RELEASE;
}
