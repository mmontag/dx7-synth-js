/**
  @constructor
  Create an n-point FFT based spectral analyzer.
*/
var SpectrumBox = function(
    width, height, foreground, background,
    canvas_id, audio_context, type) {
  this.canvas = document.getElementById(canvas_id);
  this.width = this.canvas.width = width;
  this.height = this.canvas.height = height;
  this.num_points = Math.pow(2, Math.ceil(Math.log(width) / Math.LN2)) * 2;
  this.update_rate_ms = 33.333;
  this.smoothing = 0.25;
  this.type = type || SpectrumBox.Types.FREQUENCY;

	this.enabled = false;

  this.ctx = this.canvas.getContext('2d');
  this.actx = audio_context;

  // Create the spectral analyzer
  this.fft = this.actx.createAnalyser();
  this.fft.fftSize = this.num_points;
  this.data = new Uint8Array(this.fft.frequencyBinCount);

  this.blackPixel = this.ctx.createImageData(1,1);
  this.blackPixel.data[0] = foreground[0];
  this.blackPixel.data[1] = foreground[1];
  this.blackPixel.data[2] = foreground[2];
  this.blackPixel.data[3] = 255;

  this.foreground = "rgb(" + foreground.join(",") + ")";
  var blend = [];
  for (var i = 0; i < foreground.length; i++) { blend[i] = Math.floor(foreground[i] * .7 + background[i] * .3); }
  this.foregroundLight = "rgb(" + blend.join(",") + ")";
  this.background = "rgb(" + background.join(",") + ")";
	this.update = this.update.bind(this);
};

SpectrumBox.Types = {
  FREQUENCY: 1,
  TIME: 2
};

/* Returns the AudioNode of the FFT. You can route signals into this. */
SpectrumBox.prototype.getAudioNode = function() {
  return this.fft;
};

/* Returns the canvas' 2D context. Use this to configure the look
   of the display. */
SpectrumBox.prototype.getCanvasContext = function() {
  return this.ctx;
};

/* Set the domain type for the graph (TIME / FREQUENCY. */
SpectrumBox.prototype.setType = function(type) {
  this.type = type;
  return this;
};

/* Enable the analyzer. Starts drawing stuff on the canvas. */
SpectrumBox.prototype.enable = function() {
//  var that = this;
//  if (!this.intervalId) {
//    this.intervalId = window.setInterval(
//        function() { that.update(); }, this.update_rate_ms);
//  }
	this.enabled = true;
  this.canvas.style.visibility = "visible";
	window.requestAnimationFrame(this.update);
  return this;
};

/* Disable the analyzer. Stops drawing stuff on the canvas. */
SpectrumBox.prototype.disable = function() {
//  if (this.intervalId) {
//    window.clearInterval(this.intervalId);
//    this.intervalId = undefined;
//  }
	this.enabled = false;
  this.canvas.style.visibility = "hidden";
  return this;
};

/* Updates the canvas display. */
SpectrumBox.prototype.update = function() {
	if (this.enabled) {
		window.requestAnimationFrame(this.update);
	}
  // Get the frequency samples
  var data = this.data;
//  if (this.type == SpectrumBox.Types.FREQUENCY) {
    this.fft.smoothingTimeConstant = this.smoothing;
    this.fft.getByteFrequencyData(data);
//  } else {
//    this.fft.smoothingTimeConstant = 0;
//    this.fft.getByteTimeDomainData(data);
//  }

  var length = data.length;

  // Clear canvas then redraw graph.
  this.ctx.fillStyle = this.background;
  this.ctx.fillRect(0, 0, this.width, this.height);
//  this.ctx.clearRect(0, 0, this.width, this.height);

  // Break the samples up into bins
  var bin_size = Math.floor(length / this.num_bins);
	this.ctx.strokeStyle = (i % 2) ? this.foreground : this.foregroundLight;
	this.ctx.beginPath();
  for (var i=0; i < length; ++i) {
		if (data[i] === 0) continue;

		this.ctx.moveTo(i, 0);
		this.ctx.lineTo(i, data[i] >> 3);

    // var sum = 0;
    // for (var j=0; j < bin_size; ++j) {
    //   sum += data[(i * bin_size) + j];
    // }

    // Calculate the average frequency of the samples in the bin
    // var average = sum / bin_size;

    // Draw the bars on the canvas
    // var bar_width = this.width / this.num_bins;
    // var scaled_average = (average / 256) * this.height;
//    if (this.type == SpectrumBox.Types.FREQUENCY) {
//      //var val = (data[i] - this.fft.minDecibels) * (this.fft.maxDecibels - this.fft.minDecibels)
////      var db = data[i]/256 * (this.fft.maxDecibels - this.fft.minDecibels) + this.fft.minDecibels;
//      // var mag = Math.pow(10, 0.05*db) * 70; // used to be 40
//      // var mag = data[i]/256;
//      this.ctx.fillRect(
//        i, this.height,
//        bar_width, -(data[i] >> 3) //db * this.height
//      );
//    } else {
//      this.ctx.putImageData(this.blackPixel, i, this.height/2 - (data[i]-128)/256 * (this.height - 1));
//    }
  }
	this.ctx.stroke();
};