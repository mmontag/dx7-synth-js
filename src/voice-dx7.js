var Operator = require('./operator');
var EnvelopeDX7 = require('./envelope-dx7');
var LfoDX7 = require('./lfo-dx7');

var OUTPUT_LEVEL_TABLE = [
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
var OL_TO_MOD_TABLE = [ // TODO: use output level to modulation index table
	// 0 - 99
	0.000000, 0.000039, 0.000078, 0.000117, 0.000157, 0.000196, 0.000254, 0.000303, 0.000360, 0.000428,
	0.000509, 0.000606, 0.000721, 0.000857, 0.001019, 0.001212, 0.001322, 0.001442, 0.001715, 0.001870,
	0.002224, 0.002425, 0.002645, 0.002884, 0.003145, 0.003430, 0.003740, 0.004079, 0.004448, 0.004851,
	0.005290, 0.005768, 0.006290, 0.006860, 0.007481, 0.008158, 0.008896, 0.009702, 0.010580, 0.011537,
	0.012582, 0.013720, 0.014962, 0.016316, 0.017793, 0.019404, 0.021160, 0.023075, 0.025163, 0.027441,
	0.029925, 0.032633, 0.035587, 0.038808, 0.042320, 0.046150, 0.050327, 0.054882, 0.059850, 0.065267,
	0.071174, 0.077616, 0.084641, 0.092301, 0.100656, 0.109766, 0.119700, 0.130534, 0.142349, 0.155232,
	0.169282, 0.184603, 0.201311, 0.219532, 0.239401, 0.261068, 0.284697, 0.310464, 0.338564, 0.369207,
	0.402623, 0.439063, 0.478802, 0.522137, 0.569394, 0.620929, 0.677128, 0.738413, 0.805245, 0.878126,
	0.957603, 1.044270, 1.138790, 1.241860, 1.354260, 1.476830, 1.610490, 1.756250, 1.915210, 2.088550,
	// 100 - 127
	2.277580, 2.483720, 2.708510, 2.953650, 3.220980, 3.512500, 3.830410, 4.177100, 4.555150, 4.967430,
	5.417020, 5.907300, 6.441960, 7.025010, 7.660830, 8.354190, 9.110310, 9.934860, 10.83400, 11.81460,
	12.88390, 14.05000, 15.32170, 16.70840, 18.22060, 19.86970, 21.66810, 23.62920
];
var ALGORITHMS = [
	{ outputMix: [0,2],         modulationMatrix: [[1], [], [3], [4], [5], [5]] },    //1
	{ outputMix: [0,2],         modulationMatrix: [[1], [1], [3], [4], [5], []] },    //2
	{ outputMix: [0,3],         modulationMatrix: [[1], [2], [], [4], [5], [5]] },    //3
	{ outputMix: [0,3],         modulationMatrix: [[1], [2], [], [4], [5], [3]] },    //4
	{ outputMix: [0,2,4],       modulationMatrix: [[1], [], [3], [], [5], [5]] },     //5
	{ outputMix: [0,2,4],       modulationMatrix: [[1], [], [3], [], [5], [4]] },     //6
	{ outputMix: [0,2],         modulationMatrix: [[1], [], [3,4], [], [5], [5]] },   //7
	{ outputMix: [0,2],         modulationMatrix: [[1], [], [3,4], [3], [5], []] },   //8
	{ outputMix: [0,2],         modulationMatrix: [[1], [1], [3,4], [], [5], []] },   //9
	{ outputMix: [0,3],         modulationMatrix: [[1], [2], [2], [4,5], [], []] },   //10
	{ outputMix: [0,3],         modulationMatrix: [[1], [2], [], [4,5], [], [5]] },   //11
	{ outputMix: [0,2],         modulationMatrix: [[1], [1], [3,4,5], [], [], []] },  //12
	{ outputMix: [0,2],         modulationMatrix: [[1], [], [3,4,5], [], [], [5]] },  //13
	{ outputMix: [0,2],         modulationMatrix: [[1], [], [3], [4,5], [], [5]] },   //14
	{ outputMix: [0,2],         modulationMatrix: [[1], [1], [3], [4,5], [], []] },   //15
	{ outputMix: [0],           modulationMatrix: [[1,2,4], [], [3], [], [5], [5]] }, //16
	{ outputMix: [0],           modulationMatrix: [[1,2,4], [1], [3], [], [5], []] }, //17
	{ outputMix: [0],           modulationMatrix: [[1,2,3], [], [2], [4], [5], []] }, //18
	{ outputMix: [0,3,4],       modulationMatrix: [[1], [2], [], [5], [5], [5]] },    //19
	{ outputMix: [0,1,3],       modulationMatrix: [[2], [2], [2], [4,5], [], []] },   //20
	{ outputMix: [0,1,3,4],     modulationMatrix: [[2], [2], [2], [5], [5], []] },    //21
	{ outputMix: [0,2,3,4],     modulationMatrix: [[1], [], [5], [5], [5], [5]] },    //22
	{ outputMix: [0,1,3,4],     modulationMatrix: [[], [2], [], [5], [5], [5]] },     //23
	{ outputMix: [0,1,2,3,4],   modulationMatrix: [[], [], [5], [5], [5], [5]] },     //24
	{ outputMix: [0,1,2,3,4],   modulationMatrix: [[], [], [], [5], [5], [5]] },      //25
	{ outputMix: [0,1,3],       modulationMatrix: [[], [2], [], [4,5], [], [5]] },    //26
	{ outputMix: [0,1,3],       modulationMatrix: [[], [2], [2], [4,5], [], []] },    //27
	{ outputMix: [0,2,5],       modulationMatrix: [[1], [], [3], [4], [4], []] },     //28
	{ outputMix: [0,1,2,4],     modulationMatrix: [[], [], [3], [], [5], [5]] },      //29
	{ outputMix: [0,1,2,5],     modulationMatrix: [[], [], [3], [4], [4], []] },      //30
	{ outputMix: [0,1,2,3,4],   modulationMatrix: [[], [], [], [], [5], [5]] },       //31
	{ outputMix: [0,1,2,3,4,5], modulationMatrix: [[], [], [], [], [], [5]] }         //32
];

var params = {};

function FMVoice(note, velocity) {
	this.down = true;
	this.note = parseInt(note, 10);
	this.frequency = FMVoice.frequencyFromNoteNumber(this.note);
	this.velocity = parseFloat(velocity);
	this.operators = new Array(6);
	for (var i = 0; i < 6; i++) {
		// Not sure about detune.
		// see https://github.com/smbolton/hexter/blob/621202b4f6ac45ee068a5d6586d3abe91db63eaf/src/dx7_voice.c#L789
		// https://github.com/asb2m10/dexed/blob/1eda313316411c873f8388f971157664827d1ac9/Source/msfa/dx7note.cc#L55
		// https://groups.yahoo.com/neo/groups/YamahaDX/conversations/messages/15919
		var opParams = params.operators[i];
		var op = new Operator(
			opParams,
			this.frequency,
			new EnvelopeDX7(opParams.levels, opParams.rates),
			new LfoDX7(opParams)
			//new EnvelopeDX7(params.pitchEnvelope.levels, params.pitchEnvelope.rates, true)
		);
		// TODO: DX7 accurate velocity sensitivity map
		op.outputLevel = (1 + (this.velocity - 1) * (opParams.velocitySens / 7)) * opParams.outputLevel;
		this.operators[i] = op;
	}
	this.updatePitchBend();
}

FMVoice.aftertouch = 0;
FMVoice.mod = 0;
FMVoice.bend = 0;

FMVoice.frequencyFromNoteNumber = function(note) {
	return 440 * Math.pow(2,(note-69)/12);
};

FMVoice.setParams = function(globalParams) {
	LfoDX7.setParams(globalParams);
	params = globalParams;
};

FMVoice.setFeedback = function(value) {
	params.fbRatio = Math.pow(2, (value - 7)); // feedback of range 0 to 7
};

FMVoice.setOutputLevel = function(operatorIndex, value) {
	params.operators[operatorIndex].outputLevel = this.mapOutputLevel(value);
};

FMVoice.updateFrequency = function(operatorIndex) {
	var op = params.operators[operatorIndex];
	if (op.oscMode == 0) {
		var freqCoarse = op.freqCoarse || 0.5; // freqCoarse of 0 is used for ratio of 0.5
		op.freqRatio = freqCoarse * (1 + op.freqFine / 100);
	} else {
		op.freqFixed = Math.pow(10, op.freqCoarse % 4) * (1 + (op.freqFine / 99) * 8.772);
	}
};

FMVoice.updateLFO = function() {
	LfoDX7.update();
};

FMVoice.setPan = function(operatorIndex, value) {
	var op = params.operators[operatorIndex];
	op.ampL = Math.cos(Math.PI / 2 * (value + 50) / 100);
	op.ampR = Math.sin(Math.PI / 2 * (value + 50) / 100);
};

FMVoice.mapOutputLevel = function(input) {
	var idx = Math.min(99, Math.max(0, Math.floor(input)));
	return OUTPUT_LEVEL_TABLE[idx] * 1.27;
};

FMVoice.channelAftertouch = function(value) {
	FMVoice.aftertouch = value;
	FMVoice.updateMod();
};

FMVoice.modulationWheel = function(value) {
	FMVoice.mod = value;
	FMVoice.updateMod();
};

FMVoice.updateMod = function() {
	var aftertouch = params.aftertouchEnabled ? FMVoice.aftertouch : 0;
	params.controllerModVal = Math.min(1.27, aftertouch + FMVoice.mod); // Allow 27% overdrive
};

FMVoice.pitchBend = function(value) {
	this.bend = value;
};

FMVoice.prototype.render = function() {
	var algorithmIdx = params.algorithm - 1;
	var modulationMatrix = ALGORITHMS[algorithmIdx].modulationMatrix;
	var outputMix = ALGORITHMS[algorithmIdx].outputMix;
	var outputScaling = 1 / outputMix.length;
	var outputL = 0;
	var outputR = 0;
	for (var i = 5; i >= 0; i--) {
		var mod = 0;
		if (params.operators[i].enabled) {
			for (var j = 0, length = modulationMatrix[i].length; j < length; j++) {
				var modulator = modulationMatrix[i][j];
				if (params.operators[modulator].enabled) {
					var modOp = this.operators[modulator];
					if (modulator === i) {
						// Operator modulates itself; use feedback ratio
						// TODO: implement 2-sample feedback averaging (anti-hunting filter)
						// http://d.pr/i/1kuZ7/3h7jQN7w
						// https://code.google.com/p/music-synthesizer-for-android/wiki/Dx7Hardware
						// http://music.columbia.edu/pipermail/music-dsp/2006-June/065486.html
						mod += modOp.val * params.fbRatio;
					} else {
						mod += modOp.val * modOp.outputLevel;
					}
				}
			}
		}
		this.operators[i].render(mod);
	}
	for (var k = 0, length = outputMix.length; k < length; k++) {
		if (params.operators[outputMix[k]].enabled) {
			var carrier = this.operators[outputMix[k]];
			var carrierParams = params.operators[outputMix[k]];
			var carrierLevel = carrier.val * carrier.outputLevel;
			outputL += carrierLevel * carrierParams.ampL;
			outputR += carrierLevel * carrierParams.ampR;
		}
	}
	return [ outputL * outputScaling, outputR * outputScaling ];
};

FMVoice.prototype.noteOff = function() {
	this.down = false;
	for (var i = 0; i < 6; i++) {
		this.operators[i].noteOff();
	}
};

FMVoice.prototype.updatePitchBend = function() {
	var frequency = FMVoice.frequencyFromNoteNumber(this.note + FMVoice.bend);
	for (var i = 0; i < 6; i++) {
		this.operators[i].updateFrequency(frequency);
	}
};

FMVoice.prototype.isFinished = function() {
	var outputMix = ALGORITHMS[params.algorithm - 1].outputMix;
	for (var i = 0; i < outputMix.length; i++) {
		if (!this.operators[outputMix[i]].isFinished()) return false;
	}
	return true;
};

module.exports = FMVoice;