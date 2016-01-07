var config = require('./config');

var PERIOD = config.period;
var PERIOD_HALF = config.period / 2;
var PERIOD_RECIP = 1 / config.period;
var LFO_RATE = config.lfoRate;
var LFO_SAMPLE_PERIOD = config.lfoSamplePeriod;
var LFO_FREQUENCY_TABLE = [ // see https://github.com/smbolton/hexter/tree/master/src/dx7_voice.c#L1002
	0.062506,  0.124815,  0.311474,  0.435381,  0.619784,
	0.744396,  0.930495,  1.116390,  1.284220,  1.496880,
	1.567830,  1.738994,  1.910158,  2.081322,  2.252486,
	2.423650,  2.580668,  2.737686,  2.894704,  3.051722,
	3.208740,  3.366820,  3.524900,  3.682980,  3.841060,
	3.999140,  4.159420,  4.319700,  4.479980,  4.640260,
	4.800540,  4.953584,  5.106628,  5.259672,  5.412716,
	5.565760,  5.724918,  5.884076,  6.043234,  6.202392,
	6.361550,  6.520044,  6.678538,  6.837032,  6.995526,
	7.154020,  7.300500,  7.446980,  7.593460,  7.739940,
	7.886420,  8.020588,  8.154756,  8.288924,  8.423092,
	8.557260,  8.712624,  8.867988,  9.023352,  9.178716,
	9.334080,  9.669644, 10.005208, 10.340772, 10.676336,
	11.011900, 11.963680, 12.915460, 13.867240, 14.819020,
	15.770800, 16.640240, 17.509680, 18.379120, 19.248560,
	20.118000, 21.040700, 21.963400, 22.886100, 23.808800,
	24.731500, 25.759740, 26.787980, 27.816220, 28.844460,
	29.872700, 31.228200, 32.583700, 33.939200, 35.294700,
	36.650200, 37.812480, 38.974760, 40.137040, 41.299320,
	42.461600, 43.639800, 44.818000, 45.996200, 47.174400,
	47.174400, 47.174400, 47.174400, 47.174400, 47.174400,
	47.174400, 47.174400, 47.174400, 47.174400, 47.174400,
	47.174400, 47.174400, 47.174400, 47.174400, 47.174400,
	47.174400, 47.174400, 47.174400, 47.174400, 47.174400,
	47.174400, 47.174400, 47.174400, 47.174400, 47.174400,
	47.174400, 47.174400, 47.174400
];
var LFO_AMP_MOD_TABLE = [ // TODO: use lfo amp mod table
	0.00000, 0.00793, 0.00828, 0.00864, 0.00902, 0.00941, 0.00982, 0.01025, 0.01070, 0.01117,
	0.01166, 0.01217, 0.01271, 0.01327, 0.01385, 0.01445, 0.01509, 0.01575, 0.01644, 0.01716,
	0.01791, 0.01870, 0.01952, 0.02037, 0.02126, 0.02220, 0.02317, 0.02418, 0.02524, 0.02635,
	0.02751, 0.02871, 0.02997, 0.03128, 0.03266, 0.03409, 0.03558, 0.03714, 0.03877, 0.04047,
	0.04224, 0.04409, 0.04603, 0.04804, 0.05015, 0.05235, 0.05464, 0.05704, 0.05954, 0.06215,
	0.06487, 0.06772, 0.07068, 0.07378, 0.07702, 0.08039, 0.08392, 0.08759, 0.09143, 0.09544,
	0.09962, 0.10399, 0.10855, 0.11331, 0.11827, 0.12346, 0.12887, 0.13452, 0.14041, 0.14657,
	0.15299, 0.15970, 0.16670, 0.17401, 0.18163, 0.18960, 0.19791, 0.20658, 0.21564, 0.22509,
	0.23495, 0.24525, 0.25600, 0.26722, 0.27894, 0.29116, 0.30393, 0.31725, 0.33115, 0.34567,
	0.36082, 0.37664, 0.39315, 0.41038, 0.42837, 0.44714, 0.46674, 0.48720, 0.50856, 0.53283
];
var LFO_PITCH_MOD_TABLE = [
	0, 0.0264, 0.0534, 0.0889, 0.1612, 0.2769, 0.4967, 1
];
var LFO_MODE_TRIANGLE = 0,
	LFO_MODE_SAW_DOWN = 1,
	LFO_MODE_SAW_UP = 2,
	LFO_MODE_SQUARE = 3,
	LFO_MODE_SINE = 4,
	LFO_MODE_SAMPLE_HOLD = 5;

var LFO_DELAY_ONSET = 0,
	LFO_DELAY_RAMP = 1,
	LFO_DELAY_COMPLETE = 2;

// Private static variables
var phaseStep = 0;
var pitchModDepth = 0;
var ampModDepth = 0;
var sampleHoldRandom = 0;
var delayTimes = [0, 0, 0];
var delayIncrements = [0, 0, 0];
var delayVals = [0, 0, 1];
var params = {};

function LfoDX7(opParams) {
	this.opParams = opParams;
	this.phase = 0;
	this.pitchVal = 0;
	this.counter = 0;
	this.ampVal = 1;
	this.ampValTarget = 1;
	this.ampIncrement = 0;
	this.delayVal = 0;
	this.delayState = LFO_DELAY_ONSET;
	LfoDX7.update();
}

LfoDX7.prototype.render = function() {
	var amp;
	if (this.counter % LFO_SAMPLE_PERIOD == 0) {
		switch (params.lfoWaveform) {
			case LFO_MODE_TRIANGLE:
				if (this.phase < PERIOD_HALF)
					amp = 4 * this.phase * PERIOD_RECIP - 1;
				else
					amp = 3 - 4 * this.phase * PERIOD_RECIP;
				break;
			case LFO_MODE_SAW_DOWN:
				amp = 1 - 2 * this.phase * PERIOD_RECIP;
				break;
			case LFO_MODE_SAW_UP:
				amp = 2 * this.phase * PERIOD_RECIP - 1;
				break;
			case LFO_MODE_SQUARE:
				amp = (this.phase < PERIOD_HALF) ? -1 : 1;
				break;
			case LFO_MODE_SINE:
				amp = Math.sin(this.phase);
				break;
			case LFO_MODE_SAMPLE_HOLD:
				amp = sampleHoldRandom;
				break;
		}

		switch (this.delayState) {
			case LFO_DELAY_ONSET:
			case LFO_DELAY_RAMP:
				this.delayVal += delayIncrements[this.delayState];
				if (this.counter / LFO_SAMPLE_PERIOD > delayTimes[this.delayState]) {
					this.delayState++;
					this.delayVal = delayVals[this.delayState];
				}
				break;
			case LFO_DELAY_COMPLETE:
				break;
		}

		// if (this.counter % 10000 == 0 && this.operatorIndex === 0) console.log("lfo amp value", this.ampVal);
		amp *= this.delayVal;
		pitchModDepth = 1 +
			LFO_PITCH_MOD_TABLE[params.lfoPitchModSens] * (params.controllerModVal + params.lfoPitchModDepth / 99);
		this.pitchVal = Math.pow(pitchModDepth, amp);
		// TODO: Simplify ampValTarget calculation.
		// ampValTarget range = 0 to 1. lfoAmpModSens range = -3 to 3. ampModDepth range =  0 to 1. amp range = -1 to 1.
		var ampSensDepth = Math.abs(this.opParams.lfoAmpModSens) * 0.333333;
		var phase = (this.opParams.lfoAmpModSens > 0) ? 1 : -1;
		this.ampValTarget = 1 - ((ampModDepth + params.controllerModVal) * ampSensDepth * (amp * phase + 1) * 0.5);
		this.ampIncrement = (this.ampValTarget - this.ampVal) / LFO_SAMPLE_PERIOD;
		this.phase += phaseStep;
		if (this.phase >= PERIOD) {
			sampleHoldRandom = 1 - Math.random() * 2;
			this.phase -= PERIOD;
		}
	}
	this.counter++;
	return this.pitchVal;
};

LfoDX7.prototype.renderAmp = function() {
	this.ampVal += this.ampIncrement;
	return this.ampVal;
};

LfoDX7.setParams = function(globalParams) {
	params = globalParams;
};

LfoDX7.update = function() {
	var frequency = LFO_FREQUENCY_TABLE[params.lfoSpeed];
	phaseStep = PERIOD * frequency/LFO_RATE; // radians per sample
	ampModDepth = params.lfoAmpModDepth * 0.01;
	// ignoring amp mod table for now. it seems shallow LFO_AMP_MOD_TABLE[params.lfoAmpModDepth];
	delayTimes[LFO_DELAY_ONSET] = (LFO_RATE * 0.001753 * Math.pow(params.lfoDelay, 3.10454) + 169.344 - 168) / 1000;
	delayTimes[LFO_DELAY_RAMP] = (LFO_RATE * 0.321877 * Math.pow(params.lfoDelay, 2.01163) + 494.201 - 168) / 1000;
	delayIncrements[LFO_DELAY_RAMP] = 1 / (delayTimes[LFO_DELAY_RAMP] - delayTimes[LFO_DELAY_ONSET]);
};

module.exports = LfoDX7;