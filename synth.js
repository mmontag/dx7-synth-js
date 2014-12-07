function Synth(voiceClass) {
	this.voices = [];
	this.voiceClass = voiceClass;
}

Synth.prototype.frequencyFromNoteNumber = function(note) {
	return 440 * Math.pow(2,(note-69)/12);
}

Synth.prototype.noteOn = function(note, velocity) {
	// if (this.voices[note] == null) {
		// Create a new synth node
		var frequency = this.frequencyFromNoteNumber(note);
		this.voices[note] = new this.voiceClass(frequency, velocity);
		// var e = document.getElementById( "k" + note );
		// if (e)
		// 	e.classList.add("pressed");
	// }
}

Synth.prototype.noteOff = function(note) {
	if (this.voices[note] != null) {
		// Shut off the note playing and clear it 
		this.voices[note].noteOff();
		// this.voices[note] = null;
		// var e = document.getElementById( "k" + note );
		// if (e)
		// 	e.classList.remove("pressed");
	}
}

Synth.prototype.panic = function() {
	for (voice in this.voices) {
		if (this.voices[voice])
			this.voices[voice].noteOff();
	}
	this.voices = [];
}

Synth.prototype.render = function() {
	var val = 0;
	for (var i = 0; i < this.voices.length; i++) {
		var voice = this.voices[i];
		if (voice) {
			val += voice.render();
			if (voice.isFinished()) {
				// Clear the note after release
				this.voices[i] = null;
			}
		}
	}
	return val;
}