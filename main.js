var SAMPLE_RATE = 44100;
var PERIOD = Math.PI * 2;
var MAX_SIDEBANDS = 50; // should be even. Total bands will be max sidebands + 1
var ANTI_ALIAS = true;

var synth = new Synth(FMVoice);
// var synth = new Synth(AdditiveFMVoice);
var midi = new MIDI(synth);

var ctx = new (window.AudioContext || window.webkitAudioContext)();
var proc = ctx.createScriptProcessor(512, 1, 1);
proc.connect(ctx.destination);

proc.onaudioprocess = function(e) {
	var output = e.outputBuffer;
	for (var channel = 0; channel < output.numberOfChannels; channel++) {
		var chOut = output.getChannelData(channel);
		for (var sample = 0, length = output.length; sample < length; sample++) {
			chOut[sample] = 0.5 * (synth.render());
		}
	}
}

// Setup frequency domain graph
var frequencybox = new SpectrumBox(2048, 2048, "fftbox", ctx);
frequencybox.foreground = "rgb(50, 50, 50)";
frequencybox.background = "rgb(240, 240, 240)";
proc.connect(frequencybox.getAudioNode());

// Setup time domain graph
var wavebox = new SpectrumBox(2048, 1024, "wavebox", ctx);
wavebox.setType(SpectrumBox.Types.TIME);
wavebox.foreground = "rgb(50, 50, 50)";
wavebox.background = "rgb(220, 220, 220)";
proc.connect(wavebox.getAudioNode());

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

/**
 * Plot the discrete Bessel sidebands to see if they match the FFT output.
 * TODO: Fix this
 * https://code.google.com/p/webkit-mirror/source/browse/Source/WebCore/platform/audio/AudioUtilities.cpp?r=5b585ab6ad799c8ed35ec7c27cbf78a7d83494e4#36
 */
function plotSidebands(bands) {
	// Flatten sidebands
	// for (sideband in sidebands) {
	// 	sidebands[sideband] = Math.abs(sidebands[sideband]);
	// }
	var sidebandCanvas = document.getElementById('sidebands');
	var sidebandCtx = sidebandCanvas.getContext('2d');
	var xscale = sidebandCanvas.width / (SAMPLE_RATE/2);
	var bands = sidebands(CARRIER, MOD, IDX);
	sidebandCtx.fillStyle = "rgb(230,230,230)";
	sidebandCtx.fillRect(0, 0, sidebandCanvas.width, sidebandCanvas.height);
	sidebandCtx.fillStyle = "rgb(200,0,0)";
	for (var band in bands) {
		sidebandCtx.fillRect(band * xscale, sidebandCanvas.height, 1, -bands[band] * sidebandCanvas.height);
	}
}

// TODO: use Qwerty keyboard code from WebMIDI demo
var keyNotes = [];
function play(e) {
	e = e || { keyCode: 0 };
	if (e.keyCode == 32) { synth.panic(); return; }
	if (e.originalEvent && e.originalEvent.repeat) return;
	clearTimeout(window._timer);
	var note = Math.floor(Math.random() * 15 + 8)*3  + baseNote;
	keyNotes[e.keyCode] = note;
	synth.noteOn(note, 0.25);
	if (e.keyCode == 0) {
		window._timer = setTimeout(function() {
			synth.noteOff(note);
		}, 1000);
	}
}

setTimeout(play, 250);
$(document).on('keydown', play);
$(document).on('keyup', function(e) {
	if (keyNotes[e.keyCode])
		synth.noteOff(keyNotes[e.keyCode]);
	keyNotes[e.keyCode] = null;
});

var baseNote = 0;
setInterval(function() {
	baseNote = (baseNote + 1) % 12;
}, 4000);


function createMML() {
	// Preview song from Wavestation in Korg Legacy Collection
	var korgDemo1 = "t92 l8 o4 $" +
		"[>cg<cea]2. [>cg<ceg]4" +
		"[>>a<a<c+fa+]2. [>>a <a <c+ e a]4" +
		"[>>f <f g+ <c g]2. [>>f <f g+ <c f]4" + 
		"[>>g <g g+ b <g+]2. [>>g <g <g]4";

	var mml = new MMLEmitter(ctx, korgDemo1);
	var noteHandler = function(e) {
		synth.noteOn(e.midi, e.volume / 20);
		e.noteOff(function() {
			synth.noteOff(e.midi);
		}, 0.1);
	};
	mml.tracks.map(function(track) { track.on('note', noteHandler); });
	return mml;
}

var mml = null;
$('.demo-button').on('click', function() {
	if (mml && mml._ended == 0) {
		mml.stop();
		synth.panic();
		mml = null;
	} else {
		mml = createMML();
		mml.start();
	}
});