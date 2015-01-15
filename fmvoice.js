ONE_CENT = Math.exp(Math.log(2)/1200);

function FMVoice(frequency, velocity) {
	var params = window.PARAMS; //PRESETS[PRESET_INDEX];
	var ops = params.operators;
	this.frequency = parseFloat(frequency);
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

FMVoice.prototype.opEnvFromParams = function(params) {
	return new Envelope(parseFloat(params.attack),
						parseFloat(params.decay),
						parseFloat(params.sustain),
						parseFloat(params.release));
};

FMVoice.prototype.render = function() {
	return this.velocity * this.algorithm(this);
};

FMVoice.prototype.noteOff = function() {
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
	return this.op1.isFinished() && this.op2.isFinished();
};
