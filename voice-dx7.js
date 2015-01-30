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