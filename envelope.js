var ENV_ATTACK = 0;
var ENV_DECAY = 1;
var ENV_SUSTAIN = 2;
var ENV_RELEASE = 3;
var ENV_OFF = 4;

var LN_OF_SMALL_NUMBER = Math.log(0.001);
var ε = 0.0015;

function Envelope(attackTime, decayTime, sustainRatio, releaseTime, min, max) {
	this.min = min || 0;
	this.max = max == null ? 1 : max;
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
	this.releaseTime = releaseTime;
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
				if (this.val <= 0) {
					this.state = ENV_OFF;
				} else {
					this.val = this.sustainLevel;
					this.state = ENV_SUSTAIN;
				}
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
	this.releaseIncrement = -(this.val - this.min) / (this.releaseTime * SAMPLE_RATE);
	this.state = ENV_RELEASE;
}
