var PIXI = require('pixi.js');

function Visualizer(containerId, width, height, backgroundColor, foregroundColor, audioContext) {
	this.render = this.render.bind(this);
	this.width = width;
	this.height = height;
	this.backgroundColor = backgroundColor;
	this.foregroundColor = foregroundColor;

	// set up audio analyser node
	this.numPoints = Math.pow(2, Math.ceil(Math.log(width) / Math.LN2)) * 2;
	this.analyzer = audioContext.createAnalyser();
	this.analyzer.smoothingTimeConstant = 0.25;
	this.analyzer.fftSize = this.numPoints;
	this.data = new Uint8Array(this.analyzer.frequencyBinCount);

	// create a pixi stage and renderer instance
	this.stage = new PIXI.Container();
	this.renderer = PIXI.autoDetectRenderer(width, height, {backgroundColor : backgroundColor});
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

Visualizer.prototype.render = function() {
	var data = this.data;
	var graphics = this.graphics;
	var height = this.height - 1;
	this.analyzer.getByteFrequencyData(data);
	// TODO: waveform mode
	// this.analyzer.getByteTimeDomainData(data);

	// draw the analyzer data
	graphics.clear();
	graphics.lineStyle(1, this.foregroundColor, 0.5);
	graphics.moveTo(0, height);
	graphics.lineTo(this.width, height);

	graphics.lineStyle(1, this.foregroundColor, 1);
	for (var i = 0, l = data.length; i < l; i++) {
		if (data[i] === 0) continue;
		graphics.moveTo(i, height);
		graphics.lineTo(i, height - (data[i] >> 3));
	}

	// render the stage
	this.renderer.render(this.stage);
	if (this.enabled) requestAnimationFrame(this.render);
};

module.exports = Visualizer;