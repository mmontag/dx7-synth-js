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
			console.log("Saved preset %s.", this.presets[this.selectedIndex].name);
		};

		this.reset = function() {
			if (confirm('Are you sure you want to reset this patch?')) {
				delete $localStorage.$storage[selectedIndex];
				this.presets[this.selectedIndex] = angular.copy(PRESETS[this.selectedIndex]);

				console.log("Reset preset %s.", this.presets[this.selectedIndex].name);
			}
		};

		// TODO: separate UI parameters from internal synth parameters
		for (var i = 0; i < PARAMS.operators.length; i++) {
			var op = PARAMS.operators[i];
			FMVoice.setOutputLevel(i, op.volume);
		}
		this.onVolumeChange = function(operatorIndex, operator) {
			FMVoice.setOutputLevel(operatorIndex, operator.volume);
			console.log("outputLevel changed", operator.outputLevel);
		};
		this.onFeedbackChange = function() {
			FMVoice.setFeedback(PARAMS.feedback);
			console.log("fbRatio changed", PARAMS.fbRatio);
		}
	}]);
})();

var FM_PARAMS = {
	name: "Init",
	algorithm: 5,
	feedback: 7,
	operators: [
		{
			rate1: 95,
			rate2: 33,
			rate3: 71,
			rate4: 25,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 1,
			volume: 0.95,
			detune: 2
		},
		{
			rate1: 98,
			rate2: 12,
			rate3: 71,
			rate4: 28,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 3.5,
			volume: 0.78,
			detune: 3
		},
		{
			rate1: 95,
			rate2: 33,
			rate3: 71,
			rate4: 25,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 1,
			volume: 1,
			detune: -5
		},
		{
			rate1: 98,
			rate2: 12,
			rate3: 71,
			rate4: 28,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 3.5,
			volume: .75,
			detune: -2
		},
		{
			rate1: 76,
			rate2: 78,
			rate3: 71,
			rate4: 70,
			level1: 99,
			level2: 0,
			level3: 0,
			level4: 0,
			freqMult: 1,
			volume: 1,
			detune: 0
		},
		{
			rate1: 98,
			rate2: 91,
			rate3: 0,
			rate4: 28,
			level1: 99,
			level2: 0,
			level3: 0,
			level4: 0,
			freqMult: 2,
			volume: 0.85,
			detune: -7
		}
	]
};
var FM_PARAMS2 = {
	name: "Tubular Bells",
	algorithm: 5,
	feedback: 7,
	operators: [
		{
			rate1: 95,
			rate2: 33,
			rate3: 71,
			rate4: 25,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 1,
			volume: 0.95,
			detune: 2
		},
		{
			rate1: 98,
			rate2: 12,
			rate3: 71,
			rate4: 28,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 3.5,
			volume: 0.78,
			detune: 3
		},
		{
			rate1: 95,
			rate2: 33,
			rate3: 71,
			rate4: 25,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 1,
			volume: 1,
			detune: -5
		},
		{
			rate1: 98,
			rate2: 12,
			rate3: 71,
			rate4: 28,
			level1: 99,
			level2: 0,
			level3: 32,
			level4: 0,
			freqMult: 3.5,
			volume: .75,
			detune: -2
		},
		{
			rate1: 76,
			rate2: 78,
			rate3: 71,
			rate4: 70,
			level1: 99,
			level2: 0,
			level3: 0,
			level4: 0,
			freqMult: 1,
			volume: 1,
			detune: 0
		},
		{
			rate1: 98,
			rate2: 91,
			rate3: 0,
			rate4: 28,
			level1: 99,
			level2: 0,
			level3: 0,
			level4: 0,
			freqMult: 2,
			volume: 0.85,
			detune: -7
		}
	]
};

var PRESET_INDEX = 0;
var PRESETS = [
	FM_PARAMS,
	FM_PARAMS2
];