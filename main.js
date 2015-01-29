var SAMPLE_RATE = 44100;
var PERIOD = Math.PI * 2;

var synth = new Synth(FMVoice);
var midi = new MIDI(synth);
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var scriptProcessor = audioContext.createScriptProcessor(1024, 0, 2);

scriptProcessor.connect(audioContext.destination);
scriptProcessor.onaudioprocess = function(e) {
	var buffer = e.outputBuffer;
	var outputL = buffer.getChannelData(0);
	var outputR = buffer.getChannelData(1);
	for (var i = 0, length = buffer.length; i < length; i++) {
		var output = synth.render();
		outputL[i] = output[0];
		outputR[i] = output[1];
	}
};

// Setup frequency domain graph
var frequencybox = new SpectrumBox(2048, 2048, "fftbox", audioContext);
frequencybox.foreground = "rgb(50, 50, 50)";
frequencybox.background = "rgb(240, 240, 240)";
scriptProcessor.connect(frequencybox.getAudioNode());

// Setup time domain graph
var wavebox = new SpectrumBox(2048, 1024, "wavebox", audioContext);
wavebox.setType(SpectrumBox.Types.TIME);
wavebox.foreground = "rgb(50, 50, 50)";
wavebox.background = "rgb(220, 220, 220)";
scriptProcessor.connect(wavebox.getAudioNode());

$('#analysis').on('click', function(){
	if ($(this).is(':checked')) {
		$('.canvasbox').show();
		frequencybox.enable();
		wavebox.enable();
	} else {
		$('.canvasbox').hide();
		frequencybox.disable();
		wavebox.disable();
	}
});
