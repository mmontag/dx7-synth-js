var MIDI = function(synth) {
  function midiMessageReceived( ev ) {
    var cmd = ev.data[0] >> 4;
    var channel = ev.data[0] & 0xf;
    var noteNumber = ev.data[1];
    var velocity = ev.data[2];

    if (channel == 9)
      return;
    if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // with MIDI, note on with velocity zero is the same as note off
      synth.noteOff( noteNumber );
    } else if (cmd == 9) {
      synth.noteOn( noteNumber, velocity/99.0); // changed 127 to 99 to incorporate "overdrive"
    } else if (cmd == 11) {
      synth.controller( noteNumber, velocity/127.0);
    } else if (cmd == 14) {
      synth.pitchBend( ((velocity * 128.0 + noteNumber)-8192)/8192.0 );
    } else if ( cmd == 10 ) {  // poly aftertouch
      synth.polyPressure(noteNumber,velocity/127)
    }
		// TODO: Implement channel aftertouch
		// else console.log( "" + ev.data[0] + " " + ev.data[1] + " " + ev.data[2])
  }

  var selectMIDI = null;
  var midiAccess = null;
  var midiIn = null;

  function selectMIDIIn( ev ) {
    if (midiIn)
      midiIn.onmidimessage = null;
    var id = ev.target[ev.target.selectedIndex].value;
    if ((typeof(midiAccess.inputs) == "function"))   //Old Skool MIDI inputs() code
      midiIn = midiAccess.inputs()[ev.target.selectedIndex];
    else
      midiIn = midiAccess.inputs.get(id);
    if (midiIn)
      midiIn.onmidimessage = midiMessageReceived;
  }

  function onMIDIStarted( midi ) {
    var preferredIndex = 0;
    midiAccess = midi;
    selectMIDI=document.getElementById("midiIn");
    if ((typeof(midiAccess.inputs) == "function")) {  //Old Skool MIDI inputs() code
      var list=midiAccess.inputs();

      // clear the MIDI input select
      selectMIDI.options.length = 0;

      for (var i = 0; (i<list.length)&&(preferredIndex==-1); i++) {
        var str = list[i].name.toString();
        if ((str.indexOf("Keyboard") != -1)||(str.indexOf("keyboard") != -1)||(str.indexOf("KEYBOARD") != -1))
          preferredIndex=i;
      }

      if (list.length) {
        for (var i = 0; i<list.length; i++) {
          selectMIDI.appendChild(new Option(list[i].name,list[i].id,i==preferredIndex,i==preferredIndex));
        }
        midiIn = list[preferredIndex];
        midiIn.onmidimessage = midiMessageReceived;
      }
    } else {  // new MIDIMap implementation:
      // clear the MIDI input select
      selectMIDI.options.length = 0;
      inputs=midiAccess.inputs.values();
      for ( var input = inputs.next(); input && !input.done; input = inputs.next()){
        input = input.value;
        var str=input.name.toString().toLowerCase();
        var preferred = !midiIn && (
          (str.indexOf("mpk") != -1)||
          (str.indexOf("lpk") != -1)||
          (str.indexOf("keyboard") != -1)||
          (str.indexOf("midi") != -1)
        );

        selectMIDI.appendChild(new Option(input.name||input.manufacturer,input.id,preferred,preferred));
        if (preferred) {
          midiIn = input;
          midiIn.onmidimessage = midiMessageReceived;
        }
      }
    }
    selectMIDI.onchange = selectMIDIIn;
  }

  function onMIDISystemError( err ) {
    console.log( "MIDI not initialized - error encountered:" + err.code );
  }

  //init: start up MIDI
  window.addEventListener('load', function() {   
    if (navigator.requestMIDIAccess)
      navigator.requestMIDIAccess().then( onMIDIStarted, onMIDISystemError );
  });
};