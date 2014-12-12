(function() {
	var app = angular.module('synthApp', []);

	app.controller('ParamsCtrl', function ($scope) {
		$scope.model = PRESETS[0];
		$scope.presetz = PRESETS;
	});

	app.controller('PresetCtrl', function () {
		this.selectedIndex = 0;
		this.presets = PRESETS;
		this.onChange = function() {
			console.log("changed preset!", this.selectedIndex);
			window.PRESET_INDEX = this.selectedIndex;
		};
	});
})();

var FM_PARAMS = {
	name: "Init",
	algorithm: 1,
	feedback: 1,
	operators: [
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 1,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 1,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 1,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 2,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 2,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 2,
			volume: 1,
			detune: 0
		}
	]
};
var FM_PARAMS2 = {
	name: "Tubular Bells",
	algorithm: 8,
	feedback: .86,
	operators: [
		{
			attack: 0,
			decay: 4,
			sustain: 0.2,
			release: 0.3,
			freqMult: 1,
			volume: 1,
			detune: 5
		},
		{
			attack: 0,
			decay: 4,
			sustain: 0.2,
			release: 0.4,
			freqMult: 4,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 4,
			sustain: 0.2,
			release: 0.3,
			freqMult: 1,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 4,
			sustain: 0.2,
			release: 0.3,
			freqMult: 1,
			volume: 1,
			detune: -5
		},
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 3,
			volume: 1,
			detune: 0
		},
		{
			attack: 0,
			decay: 2,
			sustain: 0.5,
			release: 0.3,
			freqMult: 2,
			volume: 1,
			detune: 0
		}
	]
};

var PRESET_INDEX = 0;
var PRESETS = [
	FM_PARAMS,
	FM_PARAMS2
];