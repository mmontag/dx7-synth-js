/*global ArrayBuffer, Uint8Array, window, XMLHttpRequest*/
// LICENSE:
// https://github.com/burnson/Reverb.js/blob/master/COPYING.md
var Reverb = {
  extend : function (audioContext) {
    function decodeBase64ToArrayBuffer(input) {
      function encodedValue(input, index) {
        var encodedCharacter, x = input.charCodeAt(index);
        if (index < input.length) {
          if (x >= 65 && x <= 90) {
            encodedCharacter = x - 65;
          } else if (x >= 97 && x <= 122) {
            encodedCharacter = x - 71;
          } else if (x >= 48 && x <= 57) {
            encodedCharacter = x + 4;
          } else if (x === 43) {
            encodedCharacter = 62;
          } else if (x === 47) {
            encodedCharacter = 63;
          } else if (x !== 61) {
            console.log('base64 encountered unexpected character code: ' + x);
          }
        }
        return encodedCharacter;
      }

      if (input.length === 0 || (input.length % 4) > 0) {
        console.log('base64 encountered unexpected length: ' + input.length);
        return;
      }

      var padding = input.match(/[=]*$/)[0].length,
        decodedLength = input.length * 3 / 4 - padding,
        buffer = new ArrayBuffer(decodedLength),
        bufferView = new Uint8Array(buffer),
        encoded = [],
        d = 0,
        e = 0,
        i;

      while (d < decodedLength) {
        for (i = 0; i < 4; i += 1) {
          encoded[i] = encodedValue(input, e);
          e += 1;
        }
        bufferView[d] = (encoded[0] * 4) + Math.floor(encoded[1] / 16);
        d += 1;
        if (d < decodedLength) {
          bufferView[d] = ((encoded[1] % 16) * 16) + Math.floor(encoded[2] / 4);
          d += 1;
        }
        if (d < decodedLength) {
          bufferView[d] = ((encoded[2] % 4) * 64) + encoded[3];
          d += 1;
        }
      }
      return buffer;
    }

    function decodeAndSetupBuffer(node, arrayBuffer, callback) {
      audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
        console.log('Finished decoding audio data.');
        node.buffer = audioBuffer;
        if (typeof callback === "function" && audioBuffer !== null) {
          callback(node);
        }
      }, function (e) {
        console.log('Could not decode audio data: ' + e);
      });
    }

    audioContext.createReverbFromBase64 = function (audioBase64, callback) {
      var reverbNode = audioContext.createConvolver();
      decodeAndSetupBuffer(reverbNode, decodeBase64ToArrayBuffer(audioBase64),
        callback);
      return reverbNode;
    };

    audioContext.createSourceFromBase64 = function (audioBase64, callback) {
      var sourceNode = audioContext.createBufferSource();
      decodeAndSetupBuffer(sourceNode, decodeBase64ToArrayBuffer(audioBase64),
        callback);
      return sourceNode;
    };

    audioContext.createReverbFromUrl = function (audioUrl, callback) {
      console.log('Downloading impulse response from ' + audioUrl);
      var reverbNode = audioContext.createConvolver(),
        request = new XMLHttpRequest();
      request.open('GET', audioUrl, true);
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          console.log('Downloaded impulse response');
          decodeAndSetupBuffer(reverbNode, request.response, callback);
        }
      };
      request.onerror = function (e) {
        console.log('There was an error receiving the response: ' + e);
        reverbjs.networkError = e;
      };
      request.responseType = 'arraybuffer';
      request.send();
      return reverbNode;
    };

    audioContext.createSourceFromUrl = function (audioUrl, callback) {
      console.log('Downloading sound from ' + audioUrl);
      var sourceNode = audioContext.createBufferSource(),
        request = new XMLHttpRequest();
      request.open('GET', audioUrl, true);
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          console.log('Downloaded sound');
          decodeAndSetupBuffer(sourceNode, request.response, callback);
        }
      };
      request.onerror = function (e) {
        console.log('There was an error receiving the response: ' + e);
        reverbjs.networkError = e;
      };
      request.responseType = 'arraybuffer';
      request.send();
      return sourceNode;
    };

    audioContext.createReverbFromBase64Url = function (audioUrl, callback) {
      console.log('Downloading base64 impulse response from ' + audioUrl);
      var reverbNode = audioContext.createConvolver(),
        request = new XMLHttpRequest();
      request.open('GET', audioUrl, true);
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          console.log('Downloaded impulse response');
          decodeAndSetupBuffer(reverbNode,
            decodeBase64ToArrayBuffer(request.response),
            callback);
        }
      };
      request.onerror = function (e) {
        console.log('There was an error receiving the response: ' + e);
        reverbjs.networkError = e;
      };
      request.send();
      return reverbNode;
    };

    audioContext.createSourceFromBase64Url = function (audioUrl, callback) {
      console.log('Downloading base64 sound from ' + audioUrl);
      var sourceNode = audioContext.createBufferSource(),
        request = new XMLHttpRequest();
      request.open('GET', audioUrl, true);
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          console.log('Downloaded sound');
          decodeAndSetupBuffer(sourceNode,
            decodeBase64ToArrayBuffer(request.response),
            callback);
        }
      };
      request.onerror = function (e) {
        console.log('There was an error receiving the response: ' + e);
        reverbjs.networkError = e;
      };
      request.send();
      return sourceNode;
    };
  }
};

module.exports = Reverb;