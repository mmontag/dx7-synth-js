var PIXI = require('pixi.js');

var MODE_WAVE = 0;
var MODE_FFT = 1;
var WAVE_PIXELS_PER_SAMPLE = 0.4;

function Visualizer(containerId, width, height, backgroundColor, foregroundColor, audioContext) {
	this.render = this.render.bind(this);
	this.width = width;
	this.height = height;
	this.backgroundColor = backgroundColor;
	this.foregroundColor = foregroundColor;

	// set up audio analyser node
	this.analyzer = audioContext.createAnalyser();
	this.analyzer.smoothingTimeConstant = 0.25;
	this.setModeFFT();
	this.setPeriod(this.width);

	// create a pixi stage and renderer instance
	this.stage = new PIXI.Container();
	this.renderer = PIXI.autoDetectRenderer(width, height, {backgroundColor : backgroundColor, resolution: 2 });
	this.el = this.renderer.view;
	this.graphics = new PIXI.Graphics();
	this.graphics.lineStyle(1, foregroundColor);
	this.stage.addChild(this.graphics);

	// add the renderer view element to the DOM
	var containerEl = document.getElementById(containerId);
	containerEl.appendChild(this.el);
	this.disable();
}

Visualizer.prototype.getAudioNode = function() {
	return this.analyzer;
};

Visualizer.prototype.enable = function() {
	this.enabled = true;
	this.el.style.visibility = "visible";
	requestAnimationFrame(this.render);
};

Visualizer.prototype.disable = function() {
	this.enabled = false;
	this.el.style.visibility = "hidden";
};

Visualizer.prototype.setModeFFT = function() {
	this.mode = MODE_FFT;
	this.analyzer.fftSize = Math.pow(2, Math.ceil(Math.log(this.width) / Math.LN2)) * 4;
	this.data = new Uint8Array(this.analyzer.frequencyBinCount);
};

Visualizer.prototype.setModeWave = function() {
	this.mode = MODE_WAVE;
	// Analyzer needs extra data padding to do phase alignment across frames
	this.analyzer.fftSize = 2048;
	this.floatData = new Float32Array(this.analyzer.frequencyBinCount);
};

Visualizer.prototype.setPeriod = function(samplePeriod) {
	if (this.mode != MODE_WAVE) return;
	this.period = samplePeriod;
};

Visualizer.prototype.render = function() {

	var data;
	var graphics = this.graphics;
	var height = this.height - 1;
	var i;

	// The time and data are sometimes duplicated. In this case we can bypass rendering.
	var sampleTime = this.analyzer.context.sampleRate * this.analyzer.context.currentTime;
	if (sampleTime != this.lastTime) {

		graphics.clear();
		this.lastTime = sampleTime;

		if (this.mode == MODE_FFT) {
			data = this.data;
			this.analyzer.getByteFrequencyData(data);

			graphics.lineStyle(1, this.foregroundColor, 0.3);
			graphics.moveTo(0, height);
			graphics.lineTo(this.width, height);

			graphics.lineStyle(1, this.foregroundColor, 1);
			for (i = 0, l = data.length; i < l; i++) {
				if (data[i] === 0) continue;
				graphics.moveTo(i, height);
				graphics.lineTo(i, height - (data[i] >> 3));
			}
		} else if (this.mode == MODE_WAVE) {
			data = this.floatData;
			this.analyzer.getFloatTimeDomainData(data);

			// Normalize...
			var max = data.reduce(function (a, b) {
				a = Math.abs(a);
				b = Math.abs(b);
				return a > b ? a : b;
			}, 0);
			var scale = Math.min(1 / max, 16) * 0.48;
			var sampleOffset = (sampleTime) % this.period - this.period;

			graphics.lineStyle(1, this.foregroundColor, 1);
			graphics.moveTo(0, height * 1.5 - (data[0] >> 2) - 1);
			for (i = 0, l = data.length; i < l; i++) {
				var x = (i + sampleOffset) * WAVE_PIXELS_PER_SAMPLE;
				if (x > this.width) break;
				graphics.lineTo(x, height / 2 + height * data[i] * scale);
			}
		}
	}

	// render the stage
	this.renderer.render(this.stage);
	if (this.enabled) requestAnimationFrame(this.render);
};

module.exports = Visualizer;