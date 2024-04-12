# Overview
Wax is a free open-source web-based audio synthesis environment that is inspired by Max and other data-flow programming systems.

In Wax, everything is a signal. It is similar to a modular synthesizer, in that all modules communicate to each other with audio signals.

The DSP modules for Wax were built with [RNBO](https://rnbo.cycling74.com/).

using facet
'regen'
managing state

# Device reference

## add
Adds `signal 1` to `signal 2`.

## adr
Generates an attack-decay-release envelope every time `trigger in` goes above 0.5.
- `attack (ms)`: the number of milliseconds to reach the envelope peak.
- `decay (ms)`: the number of miliseconds to go from the envelope peak to the `level` value.
- `level`: the maximum value that the envelope reaches.
- `release (ms)`: the number of milliseconds to go from the `level`value to silence.

## allpass
Applies an allpass filter to `signal in`.
- `gain` controls the gain of the allpass filter.
- `delay (ms)` controls the delay of the allpass filter.  

## and
Computes the logical AND of `signal in 1` `signal in 2`.

## bpf
Applies a band-pass filter to `signal in`.
- `cutoff` controls the center frequency of the filter.
- `q` controls the resonance of the filter at the cutoff. 

## clip
Clips any values in `signal in 1` below `minimum` or above `maximum` to be equal to `minimum` and `maximum`, respectively. 

## clock_divider
Returns metronomic subdivisions of `root click time (ms)`. Each outlet runs at a different, increasingly faster speed.

## comment
Stores text in the workspace which can be saved and loaded as part of system presets.

## counter
Counts upwards from 0 to `maximum`, incrementing every time `trigger` goes above 0.5.
- `set` immediately sets the counter to that value.

## cycle
Generates a sine wave between -1 and 1, oscillating at `frequency (hz)`.    

## delay
Applies a delay effect to `signal in`, lasting `delay time (ms)` and feeding back based on `feedback`.

## divide
Divides `signal 1` and `signal 2`.

## downsamp
Downsamples `signal in`  by `amount`.

## drunk
Generates a new value in a random walk of values between 0 and `maximum`, with `step` being the maximum value between each step, every time `trigger` goes above 0.5.

## equals
Computes the logical EQUALS of `signal in 1` `signal in 2`.

## fold
Folds any values in `signal in 1` below `minimum` or above `maximum`. If the input value exceeds `maximum`, the output will be the amount above subtracted from `maximum`.  If the input value is below `minimum`, the output will be the amount below added to from `minimum`. 

## freqshift
Applies a time-domain frequency shift effect of `shift amount (hz)` to `signal in`.  Outlet 1 is the positive sideband of the ring modulation; Outlet 2 is the negative sideband. 

## greater
Computes the boolean representation of whether `signal in 1` is greater than `signal in 2`.

## hpf
Applies a high-pass filter to `signal in`.
- `cutoff` controls the center frequency of the filter.
- `q` controls the resonance of the filter at the cutoff.

## hztoms
Converts an input value in  `hz` to its equivalent number in `milliseconds`.

## hztosamps
Converts an input value in  `hz` to its equivalent number in `samples`.  

## less
Computes the boolean representation of whether `signal in 1` is greater than `signal in 2`.

## limi
Applies a peak-limiter to `signal in 1`. 

## line
Generates an envelope every time `trigger` goes above 0.5. The `segments` of the envelope must be a list of numbers which adhere to the list syntax from Max MSP. To quote their [documentation](https://docs.cycling74.com/max8/refpages/line): "The first number specifies a target value, and the second number specifies a total amount of time (in milliseconds)". So `0 0 1 10 0 1000` means "go to 0 in 0 ms; then go to 1 in 10 ms; then go to 0 in 1000ms."

## lpf
Applies a low-pass filter to `signal in`.
- `cutoff` controls the center frequency of the filter.
- `q` controls the resonance of the filter at the cutoff.

## microphone input
Returns the selected `microphone input` device as a signal.

## mstohz
Converts an input value in  `ms` to its equivalent number in `hz`.

## mstosamps
Converts an input value in  `ms` to its equivalent number in `samples`.

## mtof
Converts an input value of a MIDI note number to its corresponding frequency in `hz`.

## modulo
Computes the modulo `operand` of `signal in`.

## noise
Generates white noise.

## number
Returns `value` as a signal.

## or
Computes the logical OR of `signal in 1` `signal in 2`.

## pattern
Generates a customizable wavetable using [Facet](https://github.com/nnirror/facet), a live coding language based in JavaScript. 
- `phase` values between 0 and 1 select a corresponding relative position in the wavetable.
- Every time the `enter` key is pressed, the pattern will reevaluate. Hold the `command` key while pressing `enter` in order to avoid creating a newline.
- **NOTE:** FacetPatterns must be initialized with `_`. So the all `pattern` devices should have code looking like the following examples, which are all valid:
	- `_.noise(16)`
	- `_.ramp(100,30,32).key('c','minor').mtof()`
	- `_.from([20,40,40,80,80,80,80,160,160,160,160,160,160,160,160]).shuffle().palindrome()`

## play
Plays an audio file at `rate` every time `trigger` goes above 0.5.

## phasor
Generates a phasor between 0 and 1, oscillating at `frequency (hz)`.

## pow
Computes `signal in` to the `operand` power.

## random
Returns a random number between 0 and `maximum`, every time `trigger` goes above 0.5.

## rampsmooth
Smooths `signal in` by linearly ramping from its previous value to its new value, ramping up over `up slope (ms)` and down over `down slope (ms)`.

## rect
Generates a rectangle wave between -1 and 1, oscillating at `frequency (hz)` and with configurable `pulsewidth`.

## reverb
Applies a reverb effect to `signal in`.
- `feedback` controls feedback of the delay lines.
- `size` functions as a coefficient, multiplying all delay line times.

## round
Rounds `signal in` to the nearest integer.  

## sah
Applies a sample-and-hold effect to `signal in`, holding its value every time `trigger` goes above 0.5.

## saw
Generates a sawtooth wave between -1 and 1, oscillating at `frequency (hz)`. 

## sampstohz
Converts an input value in  `samples` to its equivalent number in `hz`.

## sampstoms
Converts an input value in  `samples` to its equivalent number in `ms`.

## scale
Translates `signal in` into a different number range.

- `low in` is the minimum value in `signal in`.
- `high in` is the maximum value in `signal in`.
- `low out` is the minimum value desired in the output.
- `high out` is the minimum value desired in the output.
- `exponent` scales the output range according to an exponential curve and should be greater than or equal to 1.

## skipper
Decides whether to pass or mute `signal in` every time the signal goes above 0.1, based on `prob`.

## slide
Smooths `signal in` by logarithmically ramping from its previous value to its new value, ramping up over `up slope (ms)` and down over `down slope (ms)`.  

## speaker
Connects to the speakers of the computer's selected audio output device on channel `speaker channel`.
**NOTE**: if you change want to use a different audio output device, you will need to reload the page. Make sure to save your state beforehand so you can reload it.

## speedlim
Slows a signal down so it only changes once for every `interval (ms)` that passes.

## sqrt
Computes the square root of `signal in 1`.
  
## times
Multiplies `signal 1` and `signal 2`. 

## tri
Generates a triangle wave between -1 and 1, oscillating at `frequency (hz)` and with configurable `pulsewidth`.

## wave
Reads through an audio file like a wavetable, with `phase` values between 0 and 1 selecting a corresponding relative position in the audio file.

## wrap
Wraps any values in `signal in 1` below `minimum` or above `maximum`. If the input value exceeds `maximum`, the output will be the amount exceeded plus `minimum` . If the input value is below `minimum`, the output will be the amount below subtracted from `maximum`. 