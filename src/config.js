var LFO_SAMPLE_PERIOD = 100;
var BUFFER_SIZE = 1024;
var POLYPHONY = 12;

if (/iPad|iPhone|iPod|Android/.test(navigator.userAgent)) {
	BUFFER_SIZE = 4096;
	POLYPHONY = 8;
}

var Config = {
	sampleRate: 44100, // gets updated with audio context rate
	lfoSamplePeriod: LFO_SAMPLE_PERIOD,
	bufferSize: BUFFER_SIZE,
	polyphony: POLYPHONY
};

module.exports = Config;
