var ENV_ATTACK = 0;
var ENV_DECAY = 1;
var ENV_SUSTAIN = 2;
var ENV_RELEASE = 3;
var ENV_OFF = 4;

var LN_OF_SMALL_NUMBER = Math.log(0.001);
var ε = 0.0015;

function EnvelopeADSR(attackTime, decayTime, sustainRatio, releaseTime, min, max) {
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
	this.decayMult = Math.exp(LN_OF_SMALL_NUMBER/(decayTime * SAMPLE_RATE));
	this.releaseTime = releaseTime;
}

EnvelopeADSR.prototype.render = function() {
	if (this.max == 0) return 0;
	switch (this.state) {
		case ENV_ATTACK:
			this.val += this.attackIncrement;
			if (this.val >= this.max - ε) {
				this.val = this.max;
				this.state = ENV_DECAY;
			}
			break;
		case ENV_DECAY:
			this.val *= this.decayMult;
			if (this.val < this.sustainLevel + ε) {
				if (this.val <= 0 + ε) {
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
			this.val *= this.releaseMult;
			if (this.val <= this.min + ε) {
				this.val = this.min;
				this.state = ENV_OFF;
			}
			break;
	}
	return this.val;
}

EnvelopeADSR.prototype.noteOff = function() {
	this.releaseMult = Math.exp(LN_OF_SMALL_NUMBER/(this.releaseTime * SAMPLE_RATE));
	this.state = ENV_RELEASE;
}
