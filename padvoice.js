function PADVoice(frequency, velocity) {
	this.frequency = frequency;
	this.velocity = velocity;
	this.spread = 1; //hz per chorus voice
	this.phase = 0;
	this.phaseStep = PERIOD * frequency/SAMPLE_RATE;
	this.hzStep = PERIOD / SAMPLE_RATE;
	this.gaussianLUT = this.initGaussian(8, 2); // half gaussian
	this.envelope = new Envelope(0.01, 1, 0.25, 0.2);
	// this.sidebands = AdditiveFMVoice.prototype.initSidebands();
	this.harmonics = this.initHarmonics(24);
	// this.harmonics[0] = .25
	this.phaseBank = this.initPhaseBank(this.harmonics, this.gaussianLUT);
	console.log(this.gaussianLUT, this.harmonics);
	this.ctr = 0;
}

PADVoice.prototype.initPhaseBank = function(harmonics, gaussian) {
	var phaseBank = [];
	for (var i = 1; i <= harmonics.length; i++) {
		if (harmonics[i - 1] > 0) {
			var freq = this.frequency * i;
			phaseBank.push({
				phase: Math.random() * PERIOD,
				phaseStep: PERIOD * freq/SAMPLE_RATE,
				mod: 0,
				modStep: PERIOD * 4/SAMPLE_RATE, 
				amp: harmonics[i - 1]
			});
			for (var j = 1; j < gaussian.length; j++) {
				var freqHi = this.frequency * i + Math.pow(j,1.8) * this.spread;
				var freqLo = this.frequency * i - Math.pow(j,1.8) * this.spread;
				var amp = harmonics[i - 1] * gaussian[j];
				phaseBank.push({
					phase: Math.random() * PERIOD,
					phaseStep: PERIOD * freqHi/SAMPLE_RATE,
					mod: 0,
					modStep: PERIOD * 4/SAMPLE_RATE, 
					amp: amp
				});
				phaseBank.push({
					phase: Math.random() * PERIOD,
					phaseStep: PERIOD * freqLo/SAMPLE_RATE,
					mod: 0,
					modStep: PERIOD * 4/SAMPLE_RATE,
					amp: amp
				});
			}
		}
	}
	return phaseBank;
}

PADVoice.prototype.initHarmonics = function(count) {
	var harmonics = [];
	for (var i = 0; i < count; i++) {
		harmonics[i] = (1/(i + 1)) * ((i + 1) % 2);
	}
	return harmonics;
};

PADVoice.prototype.initGaussian = function(tableSize, deviations) {
	/* Build a lookup table of normal distribution, with sd = 1\
	   Note: only returns the positive half of the distribution.

		|    |    |    |    |    |    |
	1	|    |    |  .'|'.  |    |    |
		|    |    | /  |  \ |    |    |
		|    |    |/   |   \|    |    |
		|    |    |    |    |    |    |
		|    |   /|    |    |\   |    |
		|    |  / |    |    | \  |    |
		|    |.'  |    |    |  '.|    |
	   _|..''|    |    |    |    |''..|_
	0	–––––––––––––––––––––––––––––––
	   -3   -2   -1    0    1    2    3  

	*/
	var gaussian = new Gaussian(0, 1);
	var norm = gaussian.pdf(0); // value at the mean
	var LUT = [];
	for (var i = 0; i < tableSize; i++) {
		LUT[i] = gaussian.pdf((i / tableSize) * deviations) / norm;
	}
	return LUT;
};

PADVoice.prototype.render = function() {
	// this.ctr++;
	// if (this.ctr > 50000) {
	// 	this.ctr = 0;
	// 	console.log('playing', this.frequency);
	// }
	var val = 0;
	for (var i = 0; i < this.phaseBank.length; i++) {
		var phaser = this.phaseBank[i];
		val += phaser.amp * Math.sin(phaser.phase);// + 8 * Math.sin(phaser.mod)); // <-- Vibrato
		phaser.phase += phaser.phaseStep;
		// phaser.mod += phaser.modStep;
		// if (phaser.phase >= PERIOD) {
		// 	phaser.phase -= PERIOD;
		// }
	}
	return 0.5 * this.velocity * this.envelope.render() * val;
};

PADVoice.prototype.noteOff = function() {
	this.envelope.noteOff();
};

PADVoice.prototype.isFinished = function() {
	return this.envelope.state == ENV_OFF;
}

var PADConfig = {

};

PADVoice.createComponents = function() {

};

// Models the normal distribution
var Gaussian = function(mean, variance) {
	if (variance <= 0) {
		throw new Error('Variance must be > 0 (but was ' + variance + ')');
	}
	this.mean = mean;
	this.variance = variance;
	this.standardDeviation = Math.sqrt(variance);
}

// Probability density function
Gaussian.prototype.pdf = function(x) {
	var m = this.standardDeviation * Math.sqrt(2 * Math.PI);
	var e = Math.exp(-Math.pow(x - this.mean, 2) / (2 * this.variance));
	return e / m;
};