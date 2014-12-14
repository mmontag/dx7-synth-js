(function() {
	var app = angular.module('synthApp', ['ngStorage']);

	app.controller('ParamsCtrl', function ($scope) {
		$scope.model = PRESETS[0];
		$scope.presetz = PRESETS;
	});

	app.controller('PresetCtrl', ['$localStorage', function ($localStorage) {
		this.storage = $localStorage.$default(PRESETS);
		this.presets = angular.copy(this.storage);
		this.selectedIndex = "1";
		window.PARAMS = this.presets[this.selectedIndex];
		this.onChange = function() {
			console.log("changed preset!", this.selectedIndex);
			// window.PRESET_INDEX = this.selectedIndex;
			window.PARAMS = this.presets[this.selectedIndex];
		};
		this.save = function() {
			this.storage[this.selectedIndex] = angular.copy(this.presets[this.selectedIndex]);
			debugger;
			console.log("Saved preset %s.", this.presets[this.selectedIndex].name);
		};
	}]);
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