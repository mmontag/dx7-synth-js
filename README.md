Additive FM Synth
=================

Additive FM synthesis using the Web MIDI API. Works in Chrome.
A matching traditional FM synth is included for comparison.
A proof of concept inspired by @nlogax. 

The problem: FM synthesis is awesome, but suffers from acute aliasing. When sidebands go too high, they get reflected back down from Nyquist and jam up your spectrum.

(Of course, sometimes this is used to great effect. Percussive FM instruments fill the spectrum with sidebands reflected back and forth between DC and Nyquist so that the result is white noise. Still, aliasing is generally undesirable in tonal instruments.)

This JavaScript prototype synthesizes FM sideband components directly with additive synthesis, and rejects any sideband above Nyquist so that no aliasing occurs.

The sidebands are derived from Bessel functions of the first kind.
The number of sidebands is limited by processing power. I was able to run 50 with no trouble, but your mileage may vary. 

Due to the sideband limitations, only a 2-Op series algorithm is included for now. (Each operator in series has a multiplicative effect on the number of sidebands in the modulated output.)
