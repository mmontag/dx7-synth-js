ONE_CENT = Math.exp(Math.log(2)/1200);

function FMVoice(note, velocity) {
	var params = PARAMS;
	var ops = params.operators;
	var frequency = this.frequencyFromNoteNumber(note);
	this.note = parseInt(note, 10);
	this.down = true;
	this.velocity = parseFloat(velocity);
	this.algorithm = this['algorithm' + parseInt(params.algorithm)];
	/* 
	Feedback notes:
	
	http://d.pr/i/1kuZ7/3h7jQN7w

	The OPS chip also contains two buffers (M and F) for assembling the 6 operators into a single voice. 
	These store linear values, so are the output of the exp LUT. The combination of multiple operators is 
	simple linear addition. The F buffer implements Tomisawa's "anti-hunting" filter (this is determined 
	from measurement of feedback waveforms) - so buffers the previous two values, and the mean of those 
	is used (feedback gain is a power of two, so multiplication by the feedback gain is a shift) as the 
	input to the next cycle.
	(https://code.google.com/p/music-synthesizer-for-android/wiki/Dx7Hardware)

	Feedback level, 0 to 7, was the number of bits by which the feedback was shifted.
	(http://music.columbia.edu/pipermail/music-dsp/2006-June/065486.html)
	*/
	this.op1 = new Operator(frequency * ops[0].freqMult * Math.pow(ONE_CENT, ops[0].detune), this.opEnvFromParams(ops[0]), ops[0]);
	this.op2 = new Operator(frequency * ops[1].freqMult * Math.pow(ONE_CENT, ops[1].detune), this.opEnvFromParams(ops[1]), ops[1]);
	this.op3 = new Operator(frequency * ops[2].freqMult * Math.pow(ONE_CENT, ops[2].detune), this.opEnvFromParams(ops[2]), ops[2]);
	this.op4 = new Operator(frequency * ops[3].freqMult * Math.pow(ONE_CENT, ops[3].detune), this.opEnvFromParams(ops[3]), ops[3]);
	this.op5 = new Operator(frequency * ops[4].freqMult * Math.pow(ONE_CENT, ops[4].detune), this.opEnvFromParams(ops[4]), ops[4]);
	this.op6 = new Operator(frequency * ops[5].freqMult * Math.pow(ONE_CENT, ops[5].detune), this.opEnvFromParams(ops[5]), ops[5]);
}

FMVoice.prototype.frequencyFromNoteNumber = function(note) {
	return 440 * Math.pow(2,(note-69)/12);
};

FMVoice.setFeedback = function(value) {
	PARAMS.fbRatio = Math.pow(2, (value - 7)); // feedback of range 0 to 7
};

FMVoice.setOutputLevel = function(operatorIndex, value) {
  PARAMS.operators[operatorIndex].outputLevel = this.mapOutputLevel(value);
};

FMVoice.mapOutputLevel = function(input) {
	var idx = Math.min(99, Math.max(0, Math.floor(input)));
	return FMVoice.egToOutputLevel[idx];
};

FMVoice.egToOutputLevel = [
	0.000000, 0.000337, 0.000476, 0.000674, 0.000952, 0.001235, 0.001602, 0.001905, 0.002265, 0.002694,
	0.003204, 0.003810, 0.004531, 0.005388, 0.006408, 0.007620, 0.008310, 0.009062, 0.010776, 0.011752,
	0.013975, 0.015240, 0.016619, 0.018123, 0.019764, 0.021552, 0.023503, 0.025630, 0.027950, 0.030480,
	0.033238, 0.036247, 0.039527, 0.043105, 0.047006, 0.051261, 0.055900, 0.060960, 0.066477, 0.072494,
	0.079055, 0.086210, 0.094012, 0.102521, 0.111800, 0.121919, 0.132954, 0.144987, 0.158110, 0.172420,
	0.188025, 0.205043, 0.223601, 0.243838, 0.265907, 0.289974, 0.316219, 0.344839, 0.376050, 0.410085,
	0.447201, 0.487676, 0.531815, 0.579948, 0.632438, 0.689679, 0.752100, 0.820171, 0.894403, 0.975353,
	1.063630, 1.159897, 1.264876, 1.379357, 1.504200, 1.640341, 1.788805, 1.950706, 2.127260, 2.319793,
	2.529752, 2.758714, 3.008399, 3.280683, 3.577610, 3.901411, 4.254519, 4.639586, 5.059505, 5.517429,
	6.016799, 6.561366, 7.155220, 7.802823, 8.509039, 9.279172, 10.11901, 11.03486, 12.03360, 13.12273
];

FMVoice.prototype.opEnvFromParams = function(params) {
	return new EnvelopeDX7(params.levels, params.rates);
};

FMVoice.prototype.render = function() {
	return this.velocity * this.algorithm(this);
};

FMVoice.prototype.noteOff = function() {
	this.down = false;
	this.op1.noteOff();
	this.op2.noteOff();
	this.op3.noteOff();
	this.op4.noteOff();
	this.op5.noteOff();
	this.op6.noteOff();
};

FMVoice.prototype.algorithm1 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render(this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio))));
	return v * 0.5;
};

FMVoice.prototype.algorithm2 = function() {
	var v = this.op1.render(this.op2.render(this.op2.val * PARAMS.fbRatio)) +
			this.op3.render(this.op4.render(this.op5.render(this.op6.render())));
	return v * 0.5;
};

FMVoice.prototype.algorithm3 = function() {
	var v = this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio)));
	return v * 0.5;
};

FMVoice.prototype.algorithm4 = function() {
	var v = this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(this.op5.render(this.op6.render(this.op4.val * PARAMS.fbRatio)));
	return v * 0.5;
};

FMVoice.prototype.algorithm5 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio));
	return v * 0.33333;
};

FMVoice.prototype.algorithm6 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op5.val * PARAMS.fbRatio));
	return v * 0.33333;
};

FMVoice.prototype.algorithm7 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op3.render(
				this.op4.render() +
				this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio))
			);
	return v * 0.5;
};

FMVoice.prototype.algorithm8 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op3.render(
				this.op4.render(this.op4.val * PARAMS.fbRatio) +
				this.op5.render(this.op6.render())
			);
	return v * 0.5;
};

FMVoice.prototype.algorithm9 = function() {
	var v = this.op1.render(this.op2.render(this.op2.val * PARAMS.fbRatio)) +
			this.op3.render(
				this.op4.render() +
				this.op5.render(this.op6.render())
			);
	return v * 0.5;
};

FMVoice.prototype.algorithm10 = function() {
	var v = this.op1.render(this.op2.render(this.op3.render(this.op3.val * PARAMS.fbRatio))) +
			this.op4.render(
				this.op5.render() +
				this.op6.render()
			);
	return v * 0.5;
};

FMVoice.prototype.algorithm11 = function() {
	var v = this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(
				this.op5.render() +
				this.op6.render(this.op6.val * PARAMS.fbRatio)
			);
	return v * 0.5;
};

FMVoice.prototype.algorithm12 = function() {
	var v = this.op3.render(
				this.op4.render() +
				this.op5.render() +
				this.op6.render()) +
			this.op1.render(this.op2.render(this.op2.val * PARAMS.fbRatio));
	return v * 0.5;
};

FMVoice.prototype.algorithm13 = function() {
	var v = this.op3.render(
				this.op4.render() +
				this.op5.render() +
				this.op6.render(this.op6.val * PARAMS.fbRatio)) +
			this.op1.render(this.op2.render());
	return v * 0.5;
};

FMVoice.prototype.algorithm14 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render(
				this.op5.render() +
				this.op6.render(this.op6.val * PARAMS.fbRatio)
			));
	return v * 0.5;
};

FMVoice.prototype.algorithm15 = function() {
	var v = this.op1.render(this.op2.render(this.op2.val * PARAMS.fbRatio)) +
			this.op3.render(this.op4.render(
				this.op5.render() +
				this.op6.render()
			));
	return v * 0.5;
};

FMVoice.prototype.algorithm16 = function() {
	var v = this.op1.render(
				this.op2.render() +
				this.op3.render(this.op4.render()) +
				this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio))
			);
	return v * 1.0;
};

FMVoice.prototype.algorithm17 = function() {
	var v = this.op1.render(
				this.op2.render(this.op2.val * PARAMS.fbRatio) +
				this.op3.render(this.op4.render()) +
				this.op5.render(this.op6.render())
			);
	return v * 1.0;
};

FMVoice.prototype.algorithm18 = function() {
	var v = this.op1.render(
				this.op2.render() +
				this.op3.render(this.op3.val * PARAMS.fbRatio) +
				this.op4.render(this.op5.render(this.op6.render()))
			);
	return v * 1.0;
};

FMVoice.prototype.algorithm19 = function() {
	var v = this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(this.op6.render(this.op6.val * PARAMS.fbRatio)) +
			this.op5.render(this.op6.render());
	return v * 0.33333;
};

FMVoice.prototype.algorithm20 = function() {
	var v = this.op1.render(this.op3.render(this.op3.val * PARAMS.fbRatio)) +
			this.op2.render(this.op3.val) +
			this.op4.render(
				this.op5.render() +
				this.op6.render()
			);
	return v * 0.33333;
};

FMVoice.prototype.algorithm21 = function() {
	var v = this.op1.render(this.op3.render(this.op3.val * PARAMS.fbRatio)) +
			this.op2.render(this.op3.val) +
			this.op4.render(this.op6.render()) +
			this.op5.render(this.op6.val);
	return v * 0.25;
};

FMVoice.prototype.algorithm22 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op4.render(this.op6.render(this.op6.val * PARAMS.fbRatio)) +
			this.op3.render(this.op6.val) +
			this.op5.render(this.op6.val);
	return v * 0.25;
};

FMVoice.prototype.algorithm23 = function() {
	var v = this.op1.render() +
			this.op2.render(this.op3.render()) +
			this.op4.render(this.op6.render(this.op6.val * PARAMS.fbRatio)) +
			this.op5.render(this.op6.val);
	return v * 0.25;
};

FMVoice.prototype.algorithm24 = function() {
	var v = this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render(this.op6.render(this.op6.val)) +
			this.op5.render(this.op6.val);
	return v * 0.2;
};

FMVoice.prototype.algorithm25 = function() {
	var v = this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render(this.op6.render(this.op6.val)) +
			this.op5.render(this.op6.val);
	return v * 0.2;
};

FMVoice.prototype.algorithm26 = function() {
	var v = this.op1.render() +
			this.op2.render(this.op3.render()) +
			this.op4.render(
				this.op5.render() +
				this.op6.render(this.op6.val * PARAMS.fbRatio)
			);
	return v * 0.33333;
};

FMVoice.prototype.algorithm27 = function() {
	var v = this.op1.render() +
			this.op2.render(this.op3.render(this.op3.val * PARAMS.fbRatio)) +
			this.op4.render(
				this.op5.render() +
				this.op6.render()
			);
	return v * 0.33333;
};

FMVoice.prototype.algorithm28 = function() {
	var v = this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render(this.op5.render(this.op5.val * PARAMS.fbRatio))) +
			this.op6.render();
	return v * 0.33333;
};

FMVoice.prototype.algorithm29 = function() {
	var v = this.op1.render() +
			this.op2.render() +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio));
	return v * 0.25;
};

FMVoice.prototype.algorithm30 = function() {
	var v = this.op1.render() +
			this.op2.render() +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio));
	return v * 0.25;
};

FMVoice.prototype.algorithm31 = function() {
	var v = this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render() +
			this.op5.render(this.op6.render(this.op6.val * PARAMS.fbRatio));
	return v * 0.2;
};

FMVoice.prototype.algorithm32 = function() {
	var v = this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render() +
			this.op5.render() +
			this.op6.render(this.op6.val * PARAMS.fbRatio);
	return v * 0.16667;
};

FMVoice.prototype.isFinished = function() {
	return this.op1.isFinished() && this.op2.isFinished() && this.op3.isFinished() &&
					this.op4.isFinished() && this.op5.isFinished() && this.op6.isFinished();
};
