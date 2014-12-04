function AdditiveFMVoice(frequency, velocity) {
	this.frequency = frequency;
	this.velocity = velocity;
	this.ampEnv = new Envelope(0, 0.1, 0.4, 0.1);
	this.indexEnv = new Envelope(0, 1, 0.1, 0.2, 1, 20);

	this.updateInterval = 128;
	this.updateIntervalInverse = 1 / this.updateInterval;
	this.updateCounter = 0;

	// Hacky sideband initial state setup
	this.sidebands = this.initSidebands();
	this.indexEnv.render();
	this.update();
	for (var i = 0; i < this.sidebands.length; i++) {
		var band = this.sidebands[i];
		band.amp = band.ampTo;
	}
}

AdditiveFMVoice.prototype.initSidebands = function() {
	var sidebands = [];
	for (var i = 0; i < MAX_SIDEBANDS + 1; i++) {
		sidebands.push({
			freq: 0,
			phase: 0,
			amp: 0,
			ampTo: 0
		});
	}
	return sidebands;
}

// Currently calculates sidebands for a 2-Operator series FM algorithm.
AdditiveFMVoice.prototype.updateSidebands = function(sidebands, carrier, mod, index) {
	var centerIdx = MAX_SIDEBANDS / 2;
	// Carson's Rule
	for (var order = 0; order < MAX_SIDEBANDS / 2; order++) {
		var amp = besselj(index, order);

		var upperIdx = centerIdx + order;
		sidebands[upperIdx].freq = carrier + mod * order;
		sidebands[upperIdx].amp = sidebands[upperIdx].ampTo;
		sidebands[upperIdx].ampTo = ANTI_ALIAS ? (sidebands[upperIdx].freq > SAMPLE_RATE/2 ? 0 : amp) : amp;

		var lowerIdx = centerIdx - order;
		sidebands[lowerIdx].freq = carrier - mod * order; // TODO: double check this
		sidebands[lowerIdx].amp = sidebands[lowerIdx].ampTo;
		sidebands[lowerIdx].ampTo = ANTI_ALIAS ? Math.pow(-1, order) * (Math.abs(sidebands[lowerIdx].freq) > SAMPLE_RATE/2 ? 0 : amp) : amp;
	}
	return sidebands;
}


AdditiveFMVoice.prototype.update = function() {
	var index = this.indexEnv.val;
	this.sidebands = this.updateSidebands(this.sidebands, this.frequency, this.frequency/4, index);
}

AdditiveFMVoice.prototype.render = function() {
	this.indexEnv.render(); // just update the value.
	if (this.updateCounter++ == this.updateInterval) {
		this.update();
		this.updateCounter = 0;
	}

	var val = 0;
	var updateRemaining = this.updateInterval - this.updateCounter;
	for (var i = 0; i < this.sidebands.length; i++) {
		var band = this.sidebands[i];
		// update sideband amplitude if necessary
		if (band && band.freq != 0) {
			var amp = (band.amp * updateRemaining + band.ampTo * this.updateCounter) * this.updateIntervalInverse;
			val += amp * Math.sin(band.phase);
			band.phase += PERIOD * band.freq/SAMPLE_RATE;
			if (band.phase >= PERIOD) band.phase -= PERIOD;
			else if (band.phase <= PERIOD) band.phase += PERIOD;
		}
	}
	return this.velocity * this.ampEnv.render() * val;
}

AdditiveFMVoice.prototype.noteOff = function() {
	this.ampEnv.noteOff();
	this.indexEnv.noteOff();
}
