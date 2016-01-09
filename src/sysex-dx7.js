var SysexDX7 = {
	bin2hex: function (s) {
		var i, f = s.length, a = [];
		for (i = 0; i < f; i++) {
			a[i] = ('0' + s.charCodeAt(i).toString(16)).slice(-2);
		}
		return a.join(' ');
	},

	// Expects bankData to be a DX7 SYSEX Bulk Data for 32 Voices
	loadBank: function (bankData) {
		var presets = [];
		for (var i = 0; i < 32; i++) {
			presets.push(this.extractPatchFromRom(bankData, i));
		}
		return presets;
	},

	// see http://homepages.abdn.ac.uk/mth192/pages/dx7/sysex-format.txt
	// Section F: Data Structure: Bulk Dump Packed Format
	extractPatchFromRom: function (bankData, patchId) {
		var dataStart = 128 * patchId + 6;
		var dataEnd = dataStart + 128;
		var voiceData = bankData.substring(dataStart, dataEnd);
		var operators = [{},{},{},{},{},{}];

		for (var i = 5; i >= 0; --i) {
			var oscStart = (5 - i) * 17;
			var oscEnd = oscStart + 17;
			var oscData = voiceData.substring(oscStart, oscEnd);
			var operator = operators[i];

			operator.rates = [oscData.charCodeAt(0), oscData.charCodeAt(1), oscData.charCodeAt(2), oscData.charCodeAt(3)];
			operator.levels = [oscData.charCodeAt(4), oscData.charCodeAt(5), oscData.charCodeAt(6), oscData.charCodeAt(7)];
			operator.keyScaleBreakpoint = oscData.charCodeAt(8);
			operator.keyScaleDepthL = oscData.charCodeAt(9);
			operator.keyScaleDepthR = oscData.charCodeAt(10);
			operator.keyScaleCurveL = oscData.charCodeAt(11) & 3;
			operator.keyScaleCurveR = oscData.charCodeAt(11) >> 2;
			operator.keyScaleRate = oscData.charCodeAt(12) & 7;
			operator.detune = Math.floor(oscData.charCodeAt(12) >> 3) - 7; // range 0 to 14
			operator.lfoAmpModSens = oscData.charCodeAt(13) & 3;
			operator.velocitySens = oscData.charCodeAt(13) >> 2;
			operator.volume = oscData.charCodeAt(14);
			operator.oscMode = oscData.charCodeAt(15) & 1;
			operator.freqCoarse = Math.floor(oscData.charCodeAt(15) >> 1);
			operator.freqFine = oscData.charCodeAt(16);
			// Extended/non-standard parameters
			operator.pan = ((i + 1)%3 - 1) * 25; // Alternate panning: -25, 0, 25, -25, 0, 25
			operator.idx = i;
			operator.enabled = true;
		}

		return {
			algorithm: voiceData.charCodeAt(110) + 1, // start at 1 for readability
			feedback: voiceData.charCodeAt(111) & 7,
			operators: operators,
			name: voiceData.substring(118, 128),
			lfoSpeed: voiceData.charCodeAt(112),
			lfoDelay: voiceData.charCodeAt(113),
			lfoPitchModDepth: voiceData.charCodeAt(114),
			lfoAmpModDepth: voiceData.charCodeAt(115),
			lfoPitchModSens: voiceData.charCodeAt(116) >> 4,
			lfoWaveform: Math.floor(voiceData.charCodeAt(116) >> 1) & 7,
			lfoSync: voiceData.charCodeAt(116) & 1,
			pitchEnvelope: {
				rates: [voiceData.charCodeAt(102), voiceData.charCodeAt(103), voiceData.charCodeAt(104), voiceData.charCodeAt(105)],
				levels: [voiceData.charCodeAt(106), voiceData.charCodeAt(107), voiceData.charCodeAt(108), voiceData.charCodeAt(109)]
			},
			controllerModVal: 0,
			aftertouchEnabled: 0
		};
	}
};

module.exports = SysexDX7;