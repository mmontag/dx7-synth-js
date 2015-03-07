var VoiceDX7 = (function(Operator, EnvelopeDX7) {
	var OCTAVE_1024 = 1.0006771307; //Math.exp(Math.log(2)/1024);
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
	var LFO_FREQUENCY_TABLE = [
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
	var AMP_MOD_TABLE = [
		0.0, 0.784829, 0.819230, 0.855139, 0.892622, 0.931748,
		0.972589, 1.015221, 1.059721, 1.106171, 1.154658, 1.205270,
		1.258100, 1.313246, 1.370809, 1.430896, 1.493616, 1.559085,
		1.627424, 1.698759, 1.773220, 1.850945, 1.932077, 2.016765,
		2.105166, 2.197441, 2.293761, 2.394303, 2.499252, 2.608801,
		2.723152, 2.842515, 2.967111, 3.097167, 3.232925, 3.374633,
		3.522552, 3.676956, 3.838127, 4.006362, 4.181972, 4.365280,
		4.556622, 4.756352, 4.964836, 5.182458, 5.409620, 5.646738,
		5.894251, 6.152612, 6.422298, 6.703805, 6.997652, 7.304378,
		7.624549, 7.958754, 8.307609, 8.671754, 9.051861, 9.448629,
		9.862789, 10.295103, 10.746365, 11.217408, 11.709099,
		12.222341, 12.758080, 13.317302, 13.901036, 14.510357,
		15.146387, 15.810295, 16.503304, 17.226690, 17.981783,
		18.769975, 19.592715, 20.451518, 21.347965, 22.283705,
		23.260462, 24.280032, 25.344294, 26.455204, 27.614809,
		28.825243, 30.088734, 31.407606, 32.784289, 34.221315,
		35.721330, 37.287095, 38.921492, 40.627529, 42.408347,
		44.267222, 46.207578, 48.232984, 50.347169, 52.75
	];
	var PITCH_MOD_TABLE = [
		0.0, 0.450584, 0.900392, 1.474744, 2.587385, 4.232292, 6.982097, 12.0
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

	function FMVoice(note, velocity) {
		var frequency = FMVoice.frequencyFromNoteNumber(note);
		this.down = true;
		this.note = parseInt(note, 10);
		this.velocity = parseFloat(velocity);
		this.operators = new Array(6);
		for (var i = 0; i < 6; i++) {
			// Not sure about detune.
			// see https://github.com/smbolton/hexter/blob/621202b4f6ac45ee068a5d6586d3abe91db63eaf/src/dx7_voice.c#L789
			// https://github.com/asb2m10/dexed/blob/1eda313316411c873f8388f971157664827d1ac9/Source/msfa/dx7note.cc#L55
			// https://groups.yahoo.com/neo/groups/YamahaDX/conversations/messages/15919
			var params = PARAMS.operators[i];
			var freq = params.oscMode ? params.freqFixed : frequency * params.freqRatio * Math.pow(OCTAVE_1024, params.detune);
			this.operators[i] = new Operator(freq, new EnvelopeDX7(params.levels, params.rates));
		}
	}

	FMVoice.frequencyFromNoteNumber = function(note) {
		return 440 * Math.pow(2,(note-69)/12);
	};

	FMVoice.setFeedback = function(value) {
		PARAMS.fbRatio = Math.pow(2, (value - 7)); // feedback of range 0 to 7
	};

	FMVoice.setOutputLevel = function(operatorIndex, value) {
		PARAMS.operators[operatorIndex].outputLevel = this.mapOutputLevel(value);
	};

	FMVoice.updateFrequency = function(operatorIndex) {
		var op = PARAMS.operators[operatorIndex];
		if (op.oscMode == 0) {
			var freqCoarse = op.freqCoarse || 0.5; // freqCoarse of 0 is used for ratio of 0.5
			op.freqRatio = freqCoarse * (1 + op.freqFine / 100);
		} else {
			op.freqFixed = Math.pow(10, op.freqCoarse % 4) * (1 + (op.freqFine / 99) * 8.772);
		}
	};

	FMVoice.setPan = function(operatorIndex, value) {
		var op = PARAMS.operators[operatorIndex];
		op.ampL = Math.cos(Math.PI / 2 * (value + 50) / 100);
		op.ampR = Math.sin(Math.PI / 2 * (value + 50) / 100);
	};

	FMVoice.mapOutputLevel = function(input) {
		var idx = Math.min(99, Math.max(0, Math.floor(input)));
		return OUTPUT_LEVEL_TABLE[idx];
	};

	FMVoice.prototype.render = function() {
		var algorithmIdx = PARAMS.algorithm - 1;
		var modulationMatrix = ALGORITHMS[algorithmIdx].modulationMatrix;
		var outputMix = ALGORITHMS[algorithmIdx].outputMix;
		var outputScaling = this.velocity / outputMix.length;
		var outputL = 0;
		var outputR = 0;
		for (var i = 5; i >= 0; i--) {
			var mod = 0;
			for (var j = 0, length = modulationMatrix[i].length; j < length; j++) {
				var modulator = modulationMatrix[i][j];
				if (modulator === i) {
					// TODO: implement 2-sample feedback averaging (anti-hunting filter)
					// http://d.pr/i/1kuZ7/3h7jQN7w
					// https://code.google.com/p/music-synthesizer-for-android/wiki/Dx7Hardware
					// http://music.columbia.edu/pipermail/music-dsp/2006-June/065486.html
					mod += this.operators[modulator].val * PARAMS.fbRatio;
				} else {
					mod += this.operators[modulator].val * PARAMS.operators[modulator].outputLevel;
				}
			}
			this.operators[i].render(mod);
		}
		for (var k = 0, length = outputMix.length; k < length; k++) {
			var carrier = this.operators[outputMix[k]];
			var carrierParams = PARAMS.operators[outputMix[k]];
			outputL += carrier.val * carrierParams.outputLevel * carrierParams.ampL;
			outputR += carrier.val * carrierParams.outputLevel * carrierParams.ampR;
		}
		return [ outputL * outputScaling, outputR * outputScaling ];
	};

	FMVoice.prototype.noteOff = function() {
		this.down = false;
		for (var i = 0; i < 6; i++) {
			this.operators[i].noteOff();
		}
	};

	FMVoice.prototype.isFinished = function() {
		var outputMix = ALGORITHMS[PARAMS.algorithm - 1].outputMix;
		for (var i = 0; i < outputMix.length; i++) {
			if (!this.operators[outputMix[i]].isFinished()) return false;
		}
		return true;
	};

	return FMVoice;
})(Operator, EnvelopeDX7);