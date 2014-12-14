ONE_CENT = Math.exp(Math.log(2)/1200);

function FMVoice(frequency, velocity) {
	var params = window.PARAMS; //PRESETS[PRESET_INDEX];
	var ops = params.operators;
	this.frequency = frequency;
	this.velocity = velocity;
	this.algorithm = this['algorithm' + parseInt(params.algorithm)];
	this.feedback = params.feedback;
	this.op1 = new Operator(frequency * ops[0].freqMult * Math.pow(ONE_CENT, ops[0].detune), this.opEnvFromParams(ops[0]));
	this.op2 = new Operator(frequency * ops[1].freqMult * Math.pow(ONE_CENT, ops[1].detune), this.opEnvFromParams(ops[1]));
	this.op3 = new Operator(frequency * ops[2].freqMult * Math.pow(ONE_CENT, ops[2].detune), this.opEnvFromParams(ops[2]));
	this.op4 = new Operator(frequency * ops[3].freqMult * Math.pow(ONE_CENT, ops[3].detune), this.opEnvFromParams(ops[3]));
	this.op5 = new Operator(frequency * ops[4].freqMult * Math.pow(ONE_CENT, ops[4].detune), this.opEnvFromParams(ops[4]));
	this.op6 = new Operator(frequency * ops[5].freqMult * Math.pow(ONE_CENT, ops[5].detune), this.opEnvFromParams(ops[5]));
}

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
	return this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render(this.op5.render(this.op6.render(this.op6.val * this.feedback))));
};

FMVoice.prototype.algorithm2 = function() {
	return this.op1.render(this.op2.render(this.op2.val * this.feedback)) +
			this.op3.render(this.op4.render(this.op5.render(this.op6.render())));
}

FMVoice.prototype.algorithm3 = function() {
	return this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(this.op5.render(this.op6.render(this.op6.val * this.feedback)));
}

FMVoice.prototype.algorithm4 = function() {
	return this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(this.op5.render(this.op6.render(this.op4.val * this.feedback)));
}

FMVoice.prototype.algorithm5 = function() {
	return this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op6.val * this.feedback));
}

FMVoice.prototype.algorithm6 = function() {
	return this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op5.val * this.feedback));
}

FMVoice.prototype.algorithm7 = function() {
	return this.op1.render(this.op2.render()) +
			this.op3.render(
				this.op4.render() +
				this.op5.render(this.op6.render(this.op6.val * this.feedback))
			);
}

FMVoice.prototype.algorithm8 = function() {
	return this.op1.render(this.op2.render()) +
			this.op3.render(
				this.op4.render(this.op4.val * this.feedback) +
				this.op5.render(this.op6.render())
			);
};

FMVoice.prototype.algorithm9 = function() {
	return this.op1.render(this.op2.render(this.op2.val * this.feedback)) +
			this.op3.render(
				this.op4.render() +
				this.op5.render(this.op6.render())
			);
};

FMVoice.prototype.algorithm10 = function() {
	return this.op1.render(this.op2.render(this.op3.render(this.op3.val * this.feedback))) +
			this.op4.render(
				this.op5.render() +
				this.op6.render()
			);
};

FMVoice.prototype.algorithm11 = function() {
	return this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(
				this.op5.render() +
				this.op6.render(this.op6.val * this.feedback)
			);
};

FMVoice.prototype.algorithm12 = function() {
	return this.op3.render(
				this.op4.render() +
				this.op5.render() +
				this.op6.render()) +
			this.op1.render(this.op2.render(this.op2.val * this.feedback));
};

FMVoice.prototype.algorithm13 = function() {
	return this.op3.render(
				this.op4.render() +
				this.op5.render() +
				this.op6.render(this.op6.val * this.feedback)) +
			this.op1.render(this.op2.render());
};

FMVoice.prototype.algorithm14 = function() {
	return this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render(
				this.op5.render() +
				this.op6.render(this.op6.val * this.feedback)
			));
};

FMVoice.prototype.algorithm15 = function() {
	return this.op1.render(this.op2.render(this.op2.val * this.feedback)) +
			this.op3.render(this.op4.render(
				this.op5.render() +
				this.op6.render()
			));
};

FMVoice.prototype.algorithm16 = function() {
	return this.op1.render(
				this.op2.render() +
				this.op3.render(this.op4.render()) +
				this.op5.render(this.op6.render(this.op6.val * this.feedback))
			);
};

FMVoice.prototype.algorithm17 = function() {
	return this.op1.render(
				this.op2.render(this.op2.val * this.feedback) +
				this.op3.render(this.op4.render()) +
				this.op5.render(this.op6.render())
			);
};

FMVoice.prototype.algorithm18 = function() {
	return this.op1.render(
				this.op2.render() +
				this.op3.render(this.op3.val * this.feedback) +
				this.op4.render(this.op5.render(this.op6.render()))
			);
};

FMVoice.prototype.algorithm19 = function() {
	return this.op1.render(this.op2.render(this.op3.render())) +
			this.op4.render(this.op6.render(this.op6.val * this.feedback)) +
			this.op5.render(this.op6.render());
};

FMVoice.prototype.algorithm20 = function() {
	return this.op1.render(this.op3.render(this.op3.val * this.feedback)) +
			this.op2.render(this.op3.val) +
			this.op4.render(
				this.op5.render() +
				this.op6.render()
			);
};

FMVoice.prototype.algorithm21 = function() {
	return this.op1.render(this.op3.render(this.op3.val * this.feedback)) +
			this.op2.render(this.op3.val) +
			this.op4.render(this.op6.render()) +
			this.op5.render(this.op6.val);
};

FMVoice.prototype.algorithm22 = function() {
	return this.op1.render(this.op2.render()) +
			this.op4.render(this.op6.render(this.op6.val * this.feedback)) +
			this.op3.render(this.op6.val) +
			this.op5.render(this.op6.val);
};

FMVoice.prototype.algorithm23 = function() {
	return this.op1.render() +
			this.op2.render(this.op3.render()) +
			this.op4.render(this.op6.render(this.op6.val * this.feedback)) +
			this.op5.render(this.op6.val);
};

FMVoice.prototype.algorithm24 = function() {
	return this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render(this.op6.render(this.op6.val)) +
			this.op5.render(this.op6.val);
};

FMVoice.prototype.algorithm25 = function() {
	return this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render(this.op6.render(this.op6.val)) +
			this.op5.render(this.op6.val);
};

FMVoice.prototype.algorithm26 = function() {
	return this.op1.render() +
			this.op2.render(this.op3.render()) +
			this.op4.render(
				this.op5.render() +
				this.op6.render(this.op6.val * this.feedback)
			);
};

FMVoice.prototype.algorithm27 = function() {
	return this.op1.render() +
			this.op2.render(this.op3.render(this.op3.val * this.feedback)) +
			this.op4.render(
				this.op5.render() +
				this.op6.render()
			);
};

FMVoice.prototype.algorithm28 = function() {
	return this.op1.render(this.op2.render()) +
			this.op3.render(this.op4.render(this.op5.render(this.op5.val * this.feedback))) +
			this.op6.render();
};

FMVoice.prototype.algorithm29 = function() {
	return this.op1.render() +
			this.op2.render() +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op6.val * this.feedback));
};

FMVoice.prototype.algorithm30 = function() {
	return this.op1.render() +
			this.op2.render() +
			this.op3.render(this.op4.render()) +
			this.op5.render(this.op6.render(this.op6.val * this.feedback));
};

FMVoice.prototype.algorithm31 = function() {
	return this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render() +
			this.op5.render(this.op6.render(this.op6.val * this.feedback));
};

FMVoice.prototype.algorithm32 = function() {
	return this.op1.render() +
			this.op2.render() +
			this.op3.render() +
			this.op4.render() +
			this.op5.render() +
			this.op6.render(this.op6.val * this.feedback);
};

FMVoice.prototype.opEnvFromParams = function(params) {
	return new Envelope(params.attack,
						params.decay,
						params.sustain,
						params.release,
						0,
						params.volume);
};

FMVoice.prototype.isFinished = function() {
	return this.op1.isFinished() && this.op2.isFinished();
};

FMVoice.createComponents = function(el) {
	for (m in FMVoice.params.OPERATORS) {
		var op = FMVoice.params.OPERATORS[m];
		var groupEl = $('<div class="param-group">').append($('<div class="group-name">').text(m));
		for (n in op) {
			var param = op[n];
			$(groupEl).append(param.render());
		}
		$(el).append(groupEl);
	}
	$(el).append($('<hr style="clear: both">'));
	$(el).append(FMVoice.params.ALGO.render());
	$(el).append(FMVoice.params.FEEDBACK.render());
	$(el).append($('<img src="algorithms.png" class="algo-diagram">'));
};
