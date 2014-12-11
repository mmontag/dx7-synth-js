(function() {
	var app = angular.module('synthApp', []);

	app.controller('ParamsCtrl', function ($scope) {
		$scope.model = FM_PARAMS;
	});
})();

var FM_PARAMS = {
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