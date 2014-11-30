/*
   SpectrumBox - A JavaScript spectral analyzer.
   Mohit Cheppudira - 0xfe.blogspot.com
*/

/**
  @constructor
  Create an n-point FFT based spectral analyzer.
  @param num_points - Number of points for transform.
  @param num_bins - Number of bins to show on canvas.
  @param canvas_id - Canvas element ID.
  @param audio_context - An AudioContext instance.
*/
SpectrumBox = function(num_points, num_bins, canvas_id, audio_context, type) {
  this.init(num_points, num_bins, canvas_id, audio_context, type);
}

SpectrumBox.Types = {
  FREQUENCY: 1,
  TIME: 2
}

SpectrumBox.prototype.init = function(
    num_points, num_bins,
    canvas_id, audio_context, type) {
  this.num_bins = num_bins;
  this.num_points = num_points;
  this.canvas_id = canvas_id;
  this.update_rate_ms = 16;
  this.smoothing = 0.25;
  this.type = type || SpectrumBox.Types.FREQUENCY;

  // Number of points we actually want to display. If zero, display all points.
  this.valid_points = 0;

  // Determine the boundaries of the canvas.
  this.canvas = document.getElementById(canvas_id);
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  if (this.type == SpectrumBox.Types.FREQUENCY) {
    this.bar_spacing = 0;
  } else {
    this.bar_spacing = 1;
  }

  this.ctx = this.canvas.getContext('2d');
  this.actx = audio_context;

  // Create the spectral analyzer
  this.fft = this.actx.createAnalyser();
  this.fft.fftSize = this.num_points;
  this.data = new Uint8Array(this.fft.frequencyBinCount);

  this.blackPixel = this.ctx.createImageData(1,1);
  this.blackPixel.data[0] = 0;
  this.blackPixel.data[1] = 0;
  this.blackPixel.data[2] = 0;
  this.blackPixel.data[3] = 255;
}

/* Returns the AudioNode of the FFT. You can route signals into this. */
SpectrumBox.prototype.getAudioNode = function() {
  return this.fft;
}

/* Returns the canvas' 2D context. Use this to configure the look
   of the display. */
SpectrumBox.prototype.getCanvasContext = function() {
  return this.ctx;
}

/* Set the number of points to work with. */
SpectrumBox.prototype.setValidPoints = function(points) {
  this.valid_points = points;
  return this;
}

/* Set the domain type for the graph (TIME / FREQUENCY. */
SpectrumBox.prototype.setType = function(type) {
  this.type = type;
  return this;
}

/* Enable the analyzer. Starts drawing stuff on the canvas. */
SpectrumBox.prototype.enable = function() {
  var that = this;
  if (!this.intervalId) {
    this.intervalId = window.setInterval(
        function() { that.update(); }, this.update_rate_ms);
  }
  return this;
}

/* Disable the analyzer. Stops drawing stuff on the canvas. */
SpectrumBox.prototype.disable = function() {
  if (this.intervalId) {
    window.clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
  return this;
}

/* Updates the canvas display. */
SpectrumBox.prototype.update = function() {
  // Get the frequency samples
  data = this.data;
  if (this.type == SpectrumBox.Types.FREQUENCY) {
    this.fft.smoothingTimeConstant = this.smoothing;
    this.fft.getByteFrequencyData(data);
  } else {
    this.fft.smoothingTimeConstant = 0;
    this.fft.getByteFrequencyData(data);
    this.fft.getByteTimeDomainData(data);
  }

  var length = data.length;
  // if (this.valid_points > 0) length = this.valid_points;

  // Clear canvas then redraw graph.
  this.ctx.fillStyle = this.background;
  this.ctx.fillRect(0, 0, this.width, this.height);
  this.ctx.fillStyle = this.foreground;
  // this.ctx.clearRect(0, 0, this.width, this.height);

  // Break the samples up into bins
//  var bin_size = Math.floor(length / this.num_bins);
  for (var i=0; i < length; ++i) {
    // var sum = 0;
    // for (var j=0; j < bin_size; ++j) {
    //   sum += data[(i * bin_size) + j];
    // }

    // Calculate the average frequency of the samples in the bin
    // var average = sum / bin_size;

    // Draw the bars on the canvas
    // var bar_width = this.width / this.num_bins;
    // var scaled_average = (average / 256) * this.height;

    var bar_width = 1;

    if (this.type == SpectrumBox.Types.FREQUENCY) {
      //var val = (data[i] - this.fft.minDecibels) * (this.fft.maxDecibels - this.fft.minDecibels)
      var db = data[i]/256 * (this.fft.maxDecibels - this.fft.minDecibels) + this.fft.minDecibels; 
      var mag = Math.pow(10, 0.05*db) * 35; // why 40? i have no idea
      // var mag = data[i]/256;
      this.ctx.fillRect(
        i * bar_width, this.height,
        bar_width - this.bar_spacing, -mag * this.height);
    } else {
      this.ctx.putImageData(this.blackPixel, i, this.height/2 - (data[i]-128)/64 * this.height + 2);
    }
  }
}