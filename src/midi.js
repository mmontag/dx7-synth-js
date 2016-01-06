var MIDI = function(synth) {
  var selectMidi = null;
  var midiAccess = null;
  var midiIn = null;

  function midiMessageReceived( ev ) {
		synth.queueMidiEvent(ev);
		return;

    var cmd = ev.data[0] >> 4;
    var channel = ev.data[0] & 0xf;
    var noteNumber = ev.data[1];
    var velocity = ev.data[2];
    // console.log( "" + ev.data[0] + " " + ev.data[1] + " " + ev.data[2])
    // console.log("midi: ch %d, cmd %d, note %d, vel %d", channel, cmd, noteNumber, velocity);
    if (channel == 9)
      return;
    if (cmd==8 || ((cmd==9)&&(velocity==0))) { // with MIDI, note on with velocity zero is the same as note off
      synth.noteOff(noteNumber);
    } else if (cmd == 9) {
      synth.noteOn(noteNumber, velocity/99.0); // changed 127 to 99 to incorporate "overdrive"
    } else if (cmd == 10) {
      //synth.polyphonicAftertouch(noteNumber, velocity/127);
    } else if (cmd == 11) {
      synth.controller(noteNumber, velocity/127);
    } else if (cmd == 12) {
      //synth.programChange(noteNumber);
    } else if (cmd == 13) {
      synth.channelAftertouch(noteNumber/127);
    } else if (cmd == 14) {
      synth.pitchBend( ((velocity * 128.0 + noteNumber)-8192)/8192.0 );
    }
  }

  function onSelectMidiChange( ev ) {
    var index = ev.target.selectedIndex;
    setMidiIn(index);
  }

  function setMidiIn(index) {
    if (!selectMidi[index])
      return;
    var id = selectMidi[index].value;
    if (midiIn)
      midiIn.onmidimessage = null;
    if ((typeof(midiAccess.inputs) == "function"))   //Old Skool MIDI inputs() code
      midiIn = midiAccess.inputs()[index];
    else
      midiIn = midiAccess.inputs.get(id);
    if (midiIn)
      midiIn.onmidimessage = midiMessageReceived;
  }

  function onMidiStarted( midi ) {
    var preferredIndex = 0;
    midiAccess = midi;
    selectMidi=document.getElementById("midiIn");
    if ((typeof(midiAccess.inputs) == "function")) {  //Old Skool MIDI inputs() code
      var list=midiAccess.inputs();

      // clear the MIDI input select
      selectMidi.options.length = 0;

      for (var i = 0; (i<list.length)&&(preferredIndex==-1); i++) {
        var str = list[i].name.toString();
        if ((str.indexOf("Keyboard") != -1)||(str.indexOf("keyboard") != -1)||(str.indexOf("KEYBOARD") != -1))
          preferredIndex=i;
      }

      if (list.length) {
        for (i = 0; i<list.length; i++) {
          selectMidi.appendChild(new Option(list[i].name,list[i].id,i==preferredIndex,i==preferredIndex));
        }
        midiIn = list[preferredIndex];
        midiIn.onmidimessage = midiMessageReceived;
      }
    } else {  // new MIDIMap implementation:
      // clear the MIDI input select
      selectMidi.options.length = 0;
      var inputs = midiAccess.inputs.values();
      for (var input = inputs.next(); input && !input.done; input = inputs.next()){
        input = input.value;
        var str = input.name.toString().toLowerCase();
        var preferred = !midiIn && (
          (str.indexOf("mpk") != -1)||
          (str.indexOf("lpk") != -1)||
          (str.indexOf("keyboard") != -1)||
          (str.indexOf("midi") != -1)
        );
        selectMidi.appendChild(new Option(input.name||input.manufacturer, input.id, preferred, preferred));
        if (preferred) {
          midiIn = input;
          midiIn.onmidimessage = midiMessageReceived;
        }
      }
      if (!midiIn) {
        setMidiIn(0);
      }
    }
    selectMidi.onchange = onSelectMidiChange;
  }

  function onMIDISystemError( err ) {
    console.log( "MIDI not initialized - error encountered:" + err.code );
  }

  //init: start up MIDI
  window.addEventListener('load', function() {   
    if (navigator.requestMIDIAccess)
      navigator.requestMIDIAccess().then( onMidiStarted, onMIDISystemError );
  });

	// Expose midi message handler
	this.send = midiMessageReceived;
};

module.exports = MIDI;