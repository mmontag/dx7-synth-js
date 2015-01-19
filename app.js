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
		this.selectedIndex = "1";
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
				rates: [90, 33, 71, 32],
				levels: [99, 0, 35, 0],
				freqRatio: 1,
				volume: 95,
				detune: 2
			},
			{
				rates: [98, 12, 71, 35],
				levels: [99, 0, 32, 0],
				freqRatio: 2,
				volume: 78,
				detune: 3
			},
			{
				rates: [95, 33, 71, 35],
				levels: [99, 0, 32, 0],
				freqRatio: 1,
				volume: 99,
				detune: -5
			},
			{
				rates: [98, 12, 71, 35],
				levels: [99, 0, 32, 0],
				freqRatio: 3,
				volume: 75,
				detune: -2
			},
			{
				rates: [76, 78, 71, 70],
				levels: [99, 0, 0, 0],
				freqRatio: 1,
				volume: 99,
				detune: 0
			},
			{
				rates: [98, 91, 0, 35],
				levels: [99, 0, 0, 0],
				freqRatio: 1,
				volume: 85,
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
				rates: [95, 33, 71, 25],
				levels: [99, 0, 32, 0],
				freqRatio: 1,
				volume: 95,
				detune: 2
			},
			{
				rates: [98, 12, 71, 28],
				levels: [99, 0, 32, 0],
				freqRatio: 3.5,
				volume: 78,
				detune: 3
			},
			{
				rates: [95, 33, 71, 25],
				levels: [99, 0, 32, 0],
				freqRatio: 1,
				volume: 99,
				detune: -5
			},
			{
				rates: [98, 12, 71, 28],
				levels: [99, 0, 32, 0],
				freqRatio: 3.5,
				volume: 75,
				detune: -2
			},
			{
				rates: [76, 78, 71, 70],
				levels: [99, 0, 0, 0],
				freqRatio: 1,
				volume: 99,
				detune: 0
			},
			{
				rates: [98, 91, 0, 28],
				levels: [99, 0, 0, 0],
				freqRatio: 2,
				volume: 85,
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
				rates: [99, 40, 33, 38],
				levels: [99, 92, 0, 0],
				freqRatio: 1,
				volume: 99,
				detune: 0
			},
			{
				rates: [99, 19, 20, 9],
				levels: [99, 87, 0, 0],
				freqRatio: 1.7,
				volume: 64,
				detune: 0
			},
			{
				rates: [99, 30, 35, 42],
				levels: [99, 92, 0, 0],
				freqRatio: 1,
				volume: 99,
				detune: 0
			},
			{
				rates: [99, 44, 50, 21],
				levels: [91, 82, 0, 0],
				freqRatio: 2,
				volume: 88,
				detune: 7
			},
			{
				rates: [99, 40, 38, 0],
				levels: [91, 82, 0, 0],
				freqRatio: 5.32,
				volume: 64,
				detune: 0
			},
			{
				rates: [99, 49, 28, 12],
				levels: [91, 82, 0, 0],
				freqRatio: 1,
				volume: 0,
				detune: 0
			}
		]
	}
];