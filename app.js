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
	});

	app.controller('PresetCtrl', ['$localStorage', function ($localStorage) {
		this.storage = $localStorage.$default(PRESETS);
		this.presets = angular.copy(this.storage);
		this.selectedIndex = "2";
		PARAMS = this.presets[this.selectedIndex];

		this.onChange = function() {
			console.log("changed preset!", this.selectedIndex);
			PARAMS = this.presets[this.selectedIndex];
			// TODO: separate UI parameters from internal synth parameters
			// TODO: better initialization of computed parameters
			for (var i = 0; i < PARAMS.operators.length; i++) {
				var op = PARAMS.operators[i];
				this.onVolumeChange(i, op);
			}
			this.onFeedbackChange();
		};

		this.save = function() {
			this.storage[this.selectedIndex] = angular.copy(this.presets[this.selectedIndex]);
			console.log("Saved preset %s.", this.presets[this.selectedIndex].name);
		};

		this.reset = function() {
			if (confirm('Are you sure you want to reset this patch?')) {
				this.storage[this.selectedIndex] = PRESETS[this.selectedIndex];
				this.presets[this.selectedIndex] = angular.copy(PRESETS[this.selectedIndex]);
				console.log("Reset preset %s.", this.presets[this.selectedIndex].name);
			}
		};

		this.onVolumeChange = function(operatorIndex, operator) {
			FMVoice.setOutputLevel(operatorIndex, operator.volume);
			console.log("outputLevel changed", operator.outputLevel);
		};

		this.onFeedbackChange = function() {
			FMVoice.setFeedback(PARAMS.feedback);
			console.log("fbRatio changed", PARAMS.fbRatio);
		};

		this.onChange();
	}]);
})();

var PARAMS = {};
var PRESETS = [
	{
		name: "Init",
		algorithm: 5,
		feedback: 7,
		operators: [
			{
				rate1: 90,
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
				freqMult: 2,
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
				freqMult: 3,
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
				freqMult: 1,
				volume: 0.85,
				detune: -7
			}
		]
	},
	{
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
	},
	{
		name: "Steel Drum",
		algorithm: 15,
		feedback: 5,
		operators: [
			{
				rate1: 99,
				rate2: 40,
				rate3: 33,
				rate4: 38,
				level1: 99,
				level2: 92,
				level3: 0,
				level4: 0,
				freqMult: 1,
				volume: 0.99,
				detune: 0
			},
			{
				rate1: 99,
				rate2: 19,
				rate3: 20,
				rate4: 9,
				level1: 99,
				level2: 87,
				level3: 0,
				level4: 0,
				freqMult: 1.7,
				volume: 0.64,
				detune: 0
			},
			{
				rate1: 99,
				rate2: 30,
				rate3: 35,
				rate4: 42,
				level1: 99,
				level2: 92,
				level3: 0,
				level4: 0,
				freqMult: 1,
				volume: 1,
				detune: 0
			},
			{
				rate1: 99,
				rate2: 44,
				rate3: 50,
				rate4: 21,
				level1: 91,
				level2: 82,
				level3: 0,
				level4: 0,
				freqMult: 2,
				volume: .88,
				detune: 7
			},
			{
				rate1: 99,
				rate2: 40,
				rate3: 38,
				rate4: 0,
				level1: 91,
				level2: 82,
				level3: 0,
				level4: 0,
				freqMult: 5.32,
				volume: .64,
				detune: 0
			},
			{
				rate1: 99,
				rate2: 49,
				rate3: 28,
				rate4: 12,
				level1: 91,
				level2: 82,
				level3: 0,
				level4: 0,
				freqMult: 1,
				volume: 0,
				detune: 0
			}
		]
	}
];