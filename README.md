Additive FM Synth
=================

Additive FM synthesis using the Web MIDI API. Works in Chrome.
Traditional FM synth is included for comparison.
A proof of concept inspired by [nlogax](https://github.com/nlogax). 

The problem: FM synthesis is awesome, but suffers from aliasing. When sidebands go too high, they get reflected back down from Nyquist and jam up your spectrum.

(Of course, sometimes this is used to great effect. Percussive FM instruments fill the spectrum with sidebands reflected back and forth between DC and Nyquist so that the result is white noise. Still, aliasing is unwanted in tonal instruments.)

This JavaScript prototype synthesizes FM sideband components directly with additive synthesis, and rejects any sideband above Nyquist so that no aliasing occurs.

With aliasing:
<img src="http://d.pr/i/ge8m/2dhPvMxO.png">

Without aliasing:
<img src="http://d.pr/i/1cNAB/4S09Cyz5.png">

The sidebands are derived from Bessel functions of the first kind.
The number of sidebands is limited because Math.sin() is expensive. I was able to run 50 with no trouble, but your mileage may vary. 

Due to the sideband limitations, only a 2-Op series algorithm is included for now. (Each operator in series has a multiplicative effect on the number of sidebands in the modulated output.)

<img src="http://d.pr/i/17nE7/PQFzPArO.png">
