var POLYPHONY = 12;
var PER_VOICE_LEVEL = 0.125 / 6; // nominal per-voice level borrowed from Hexter
var PITCH_BEND_RANGE = 2; // semitones (in each direction)

var MIDI_CC_MODULATION = 1,
	MIDI_CC_SUSTAIN_PEDAL = 64;

function Synth(voiceClass) {
	this.voices = [];
	this.voiceClass = voiceClass;
	this.sustainPedalDown = false;
	this.bend = 0;
	this.aftertouch = 0;
	this.mod = 0;
}

Synth.prototype.controller = function(controlNumber, value) {
	// see http://www.midi.org/techspecs/midimessages.php#3
	switch (controlNumber) {
		case MIDI_CC_MODULATION:
			this.mod = value;
			this.updateMod();
			break;
		case MIDI_CC_SUSTAIN_PEDAL:
			this.sustainPedal(value > 0.5);
			break;
	}
};

Synth.prototype.channelAftertouch = function(value) {
	this.aftertouch = value;
	this.updateMod();
};

Synth.prototype.updateMod = function() {
	var aftertouch = PARAMS.aftertouchEnabled ? this.aftertouch : 0;
	PARAMS.controllerModVal = Math.min(1.27, aftertouch + this.mod); // Allow 27% overdrive
};

Synth.prototype.sustainPedal = function(down) {
	if (down) {
		this.sustainPedalDown = true;
	} else {
		this.sustainPedalDown = false;
		for (var i = 0, l = this.voices.length; i < l; i++) {
			if (this.voices[i] && this.voices[i].down === false)
				this.voices[i].noteOff();
		}
	}
};

Synth.prototype.pitchBend = function(value) {
	this.bend = value * PITCH_BEND_RANGE;
	for (var i = 0, l = this.voices.length; i < l; i++) {
		if (this.voices[i])
			this.voices[i].pitchBend(this.bend);
	}
};

Synth.prototype.noteOn = function(note, velocity) {
		var voice = new this.voiceClass(note, velocity, this.bend);
		if (this.voices.length >= POLYPHONY) {
			// TODO: fade out removed voices
			this.voices.shift(); // remove first
		}
		this.voices.push(voice);
};

Synth.prototype.noteOff = function(note) {
	for (var i = 0, voice; i < this.voices.length, voice = this.voices[i]; i++) {
		if (voice && voice.note === note && voice.down === true) {
			voice.down = false;
			if (this.sustainPedalDown === false)
				voice.noteOff();
			break;
		}
	}
};

Synth.prototype.panic = function() {
	for (var i = 0, l = this.voices.length; i < l; i++) {
		if (this.voices[i])
			this.voices[i].noteOff();
	}
	this.voices = [];
};

Synth.prototype.render = function() {
	var output;
	var outputL = 0;
	var outputR = 0;

	for (var i = 0, length = this.voices.length; i < length; i++) {
		var voice = this.voices[i];
		if (voice) {
			if (voice.isFinished()) {
				// Clear the note after release
				this.voices.splice(i, 1);
				i--; // undo increment
			} else {
				output = voice.render();
				outputL += output[0];
				outputR += output[1];
			}
		}
	}
	return [outputL * PER_VOICE_LEVEL, outputR * PER_VOICE_LEVEL];
};

module.exports = Synth;