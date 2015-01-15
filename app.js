(function() {
	var app = angular.module('synthApp', ['ngStorage']);

	app.directive('toNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                ctrl.$parsers.push(function (value) {
                    return parseFloat(value || '');
                });
            }
        };
    });

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
		this.onFeedbackChange = function() {
			PARAMS.fbRatio = Math.pow(2, (PARAMS.feedback - 7)); // feedback of range 0 to 7
			console.log("fbRatio changed", PARAMS.fbRatio);
		}
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
	algorithm: 5,
	feedback: 0.34,
	operators: [
		{
			attack: 0,
			decay: 3,
			sustain: 0.77,
			release: 1.6,
			freqMult: 2,
			volume: 1,
			detune: 2
		},
		{
			attack: 0,
			decay: 3,
			sustain: 0.85,
			release: 1.48,
			freqMult: 7,
			volume: 0.8,
			detune: 3
		},
		{
			attack: 0,
			decay: 3,
			sustain: 0.73,
			release: 1.07,
			freqMult: 2,
			volume: 1,
			detune: -5
		},
		{
			attack: 0,
			decay: 2.99,
			sustain: 0.35,
			release: 1.14,
			freqMult: 7,
			volume: 0.75,
			detune: -2
		},
		{
			attack: 0,
			decay: 1.33,
			sustain: 0,
			release: 1.04,
			freqMult: 5,
			volume: 2.39,
			detune: -5
		},
		{
			attack: 0,
			decay: 1.58,
			sustain: 0,
			release: 1.78,
			freqMult: 7,
			volume: 0.99,
			detune: -7
		}
	]
};

var PRESET_INDEX = 0;
var PRESETS = [
	FM_PARAMS,
	FM_PARAMS2
];