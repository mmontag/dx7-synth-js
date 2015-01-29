var EnvelopeDX7 = (function() {
	// Based on http://wiki.music-synthesizer-for-android.googlecode.com/git/img/env.html
	var ENV_OFF = 4;
	var envmask = [
		[0, 1, 0, 1, 0, 1, 0, 1],
		[0, 1, 0, 1, 0, 1, 1, 1],
		[0, 1, 1, 1, 0, 1, 1, 1],
		[0, 1, 1, 1, 1, 1, 1, 1]
	];
	var outputlevel = [0, 5, 9, 13, 17, 20, 23, 25, 27, 29, 31, 33, 35, 37, 39,
		41, 42, 43, 45, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
		62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
		81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
		100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
		115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127];

	function envenable(i, qr) {
		var shift = (qr >> 2) - 11;
		if (shift < 0) {
			var sm = (1 << -shift) - 1;
			if ((i & sm) != sm) return false;
			i >>= -shift;
		}
		return envmask[qr & 3][i & 7] != 0;
	}

	function attackstep(lev, i, qr) {
		var shift = (qr >> 2) - 11;
		if (!envenable(i, qr)) return lev;
		var slope = 17 - (lev >> 8);
		lev += slope << Math.max(shift, 0);
		return lev;
	}

	function decaystep(lev, i, qr) {
		var shift = (qr >> 2) - 11;
		if (!envenable(i, qr)) return lev;
		lev -= 1 << Math.max(shift, 0);
		return lev;
	}

	function EnvelopeDX7(levels, rates) {
		this.levels = levels;
		this.rates = rates;
		this.level = 0; // should start here
		this.i = 0;
		this.down = true;
		this.advance(0);
	}

	EnvelopeDX7.prototype.render = function() {
		if (envenable(this.i, this.qr) && (this.state < 3 || (this.state < 4 && !this.down))) {
			var lev;
			if (this.rising) {
				lev = attackstep(this.level, this.i, this.qr);
				// console.log(lev);
				if (lev >= this.targetlevel) {
					lev = this.targetlevel;
					this.advance(this.state + 1);
					// console.log("rise complete, advanced to state", this.state);
				}
				this.level = lev;
			} else {
				lev = decaystep(this.level, this.i, this.qr);
				if (lev <= this.targetlevel) {
					lev = this.targetlevel;
					this.advance(this.state + 1);
					// console.log("fall complete, advanced to state", this.state);
				}
				this.level = lev;
			}
		}
		this.i++;
		// return this.level;
		// Convert DX7 level -> dB -> amplitude
		var dB = (this.level - 3824) * 0.0235;
		return Math.pow(20, (dB/20));
	};

	EnvelopeDX7.prototype.advance = function(newstate) {
		this.state = newstate;
		if (this.state < 4) {
			var newlevel = this.levels[this.state];
			this.targetlevel = Math.max(0, (outputlevel[newlevel] << 5) - 224);
			this.rising = (this.targetlevel - this.level) > 0;
			var rate_scaling = 0;
			this.qr = Math.min(63, rate_scaling + ((this.rates[this.state] * 41) >> 6));
		}
		//console.log("advance state="+this.state+", qr="+this.qr+", target="+this.targetlevel+", rising="+this.rising);
	};

	EnvelopeDX7.prototype.noteOff = function() {
		this.down = false;
		this.advance(3);
	};

	EnvelopeDX7.prototype.isFinished = function() {
		return this.state == ENV_OFF;
	};

	return EnvelopeDX7;
})();