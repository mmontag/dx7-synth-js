var PER_VOICE_LEVEL = 0.125 / 6; // nominal per-voice level borrowed from Hexter
var PITCH_BEND_RANGE = 2; // semitones (in each direction)

var MIDI_CC_MODULATION = 1,
	MIDI_CC_SUSTAIN_PEDAL = 64;

// TODO: Probably reduce responsibility to voice management; rename VoiceManager, MIDIChannel, etc.
function Synth(voiceClass, polyphony) {
	this.voices = [];
	this.voiceClass = voiceClass;
	this.polyphony = polyphony || 12;
	this.sustainPedalDown = false;
	this.eventQueue = [];
}

Synth.prototype.queueMidiEvent = function(ev) {
	this.eventQueue.push(ev);
};

Synth.prototype.processMidiEvent = function(ev) {
	var cmd = ev.data[0] >> 4;
	var channel = ev.data[0] & 0xf;
	var noteNumber = ev.data[1];
	var velocity = ev.data[2];
	// console.log( "" + ev.data[0] + " " + ev.data[1] + " " + ev.data[2])
	// console.log("midi: ch %d, cmd %d, note %d, vel %d", channel, cmd, noteNumber, velocity);
	if (channel == 9) // Ignore drum channel
		return;
	if (cmd==8 || ((cmd==9)&&(velocity==0))) { // with MIDI, note on with velocity zero is the same as note off
		this.noteOff(noteNumber);
	} else if (cmd == 9) {
		this.noteOn(noteNumber, velocity/99.0); // changed 127 to 99 to incorporate "overdrive"
	} else if (cmd == 10) {
		//this.polyphonicAftertouch(noteNumber, velocity/127);
	} else if (cmd == 11) {
		this.controller(noteNumber, velocity/127);
	} else if (cmd == 12) {
		//this.programChange(noteNumber);
	} else if (cmd == 13) {
		this.channelAftertouch(noteNumber/127);
	} else if (cmd == 14) {
		this.pitchBend( ((velocity * 128.0 + noteNumber)-8192)/8192.0 );
	}

};

Synth.prototype.getLatestNoteDown = function() {
	var voice = this.voices[this.voices.length - 1] || { note: 64 };
	return voice.note;
};

Synth.prototype.controller = function(controlNumber, value) {
	// see http://www.midi.org/techspecs/midimessages.php#3
	switch (controlNumber) {
		case MIDI_CC_MODULATION:
			this.voiceClass.modulationWheel(value);
			break;
		case MIDI_CC_SUSTAIN_PEDAL:
			this.sustainPedal(value > 0.5);
			break;
	}
};

Synth.prototype.channelAftertouch = function(value) {
	this.voiceClass.channelAftertouch(value);
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
	this.voiceClass.pitchBend(value * PITCH_BEND_RANGE);
	for (var i = 0, l = this.voices.length; i < l; i++) {
		if (this.voices[i])
			this.voices[i].updatePitchBend();
	}
};

Synth.prototype.noteOn = function(note, velocity) {
		var voice = new this.voiceClass(note, velocity);
		if (this.voices.length >= this.polyphony) {
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
	this.sustainPedalDown = false;
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