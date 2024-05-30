# Overview
Wax is a browser-based audio synthesis environment inspired by Max and other data-flow programming systems.

By adding devices to a virtual workspace and connecting them together, you can create custom digital signal processing algorithms.

All devices communicate to each other with audio signals, similar to a modular synthesizer.

# Getting started

Wax runs entirely in the browser. When you load the web page, the virtual workspace is empty except for two `speaker` devices at the bottom.

To view a list of all objects, press the "all devices" button. This will list each device along with a link to its below documentation.

# Examples
In the top-left corner of the web app, there is an `examples` folder containing several pre-patched system states to demonstrate how elements can be connected together. Select any element from the dropdown to load that state.

## Adding devices
Double-click or press 'n' to open the interface for adding a device to the workspace. Then begin typing to find the object you want to add. Press `enter` or click the `add` button to add the device to the workspace.

For device documentation, click the `i` button at the top of the device.

## Creating connections
Creating connections between two devices will create a data flow between them at audio rate, from the output of the `source device` to the input of the `target device`. Device outputs are listed as buttons on the bottom of the device, and device inputs are listed as button on the top.

## Manipulating devices
Click-drag on the workspace to select multiple devices at once. Selected devices have a bold, white border. Selected devices are draggable to anywhere the workspace.

## Deleting devices
When a device is selected, press `delete` or click the `x` button to delete the device.

## Device parameters
Some devices have text inputs which allow the user to type in values to control the device. These text inputs accept numbers or expressions in [Facet](https://github.com/nnirror/facet), a live coding language based in JavaScript. Press `enter` to transmit the number or expression into the device, or if on a mobile device, press the `regen` button.

**IMPORTANT:** Many parameters are available via both the text input _and_ as an audio rate data flow connection. In this case, the text input takes precedence, and the audio rate data flow connection will only modulate the parameter if the corresponding text input is empty.

As an example, here are several useful Facet commands, which allow you add tunable randomness to device parameters:
- `choose()`. For example: `choose([1,2,34]) // each time it's regenerated, it will choose either 1,2,3, or 4`
- `rf()`. For example: `rf(-1,1) // random float between -1 and 1`
- `ri()`. For example: `ri(10,60) // random integer between 10 and 60`

## Regenerating device parameters
Some devices have a `regen` button which causes all device parameters to regenerate every time a signal connected to `regen` goes above 0.5. For static numbers, this will have no effect, but if the device parameter is written as Facet code, the resulting can be different each time it's generated.

For example, if you have a `number` device, and you enter `ri(10,1000)` for its `value`, then each time the `regen` signal goes above 0.5, the output from `number` will be a new, random integer between 10 and 1000. If you entered `choose([2,3,4,6,8])` as its `value`, then the output from `number` would be either 2, 3, 4, 6, or 8.

**IMPORTANT:** inputs will not regenerate while the cursor is inside of it. After modifying an input, click outside of it to begin regenerating.

## Key combinations
- create new device: `n`
- duplicate selected device(s): `[command] + d`
- delete selected device(s): `delete`
- create number device: `f`
- create comment device: `c`
- create toggle device: `t`
- create button device: `b`

# Managing state
In Wax, system states can be saved, reloaded, and shared.

## Saving a state
Press the `save` button to save the system state as a zip file, including all audio files that were loaded.

## Loading state
Press the `load` button to load a previously saved .zip file, including all audio files.

## Recording a session
With devices connected to a speaker objet, press the `start recording` button. When you want to stop, press the `stop recording button`, and enter the name for your wav file. It will then initiate an automatic download to your computer. **NOTE:** on mobile devices, recordings that include microphone input might sound garbled.

# Device reference

## abs
Computes the absolute value of the input signal.

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

## buffer
Loads an audio buffer into the workpace so it can be accessed by the `pattern` object via the `sample()` Facet method. 

## button
Outputs a 1 while the button is pressed and otherwise outputs 0.

## change
Compares the current sample with the previous sample value in the signal and returns 1 if the current sample value increased, -1 if it decreased, and 0 if it stayed the same.

## clip
Clips any values in `signal in 1` below `minimum` or above `maximum` to be equal to `minimum` and `maximum`, respectively. 

## clock_divider
Returns metronomic subdivisions of `root click time (ms)`. Each outlet runs at a different, increasingly faster speed.

## comb
Applies a comb filter effect to the input signal. `feedback` expect a range of floats 0 - 1.

## comment
Stores text in the workspace which can be saved and loaded as part of system presets.

## cross
Imparts the spectral envelope of `modulator signal in` onto `carrier signal in`.

## counter
Counts upwards from 0 to `maximum`, incrementing every time `trigger` goes above 0.5. `hit maximum` will output a 1 while the counter is at its maximum and a 0 otherwise.
- `set` immediately sets the counter to that value.

## cycle
Generates a sine wave between -1 and 1, oscillating at `frequency (hz)`.    

## delay
Applies a delay effect to `signal in`, lasting `delay time (ms)` and feeding back based on `feedback`.
- `wet` controls dry/wet balance and expects a range of floats 0 - 1.

## divide
Divides `signal 1` and `signal 2`.

## downsamp
Downsamples `signal in` by `amount`, which expects a range of floats 0 - 1. Higher `amount` values produce more downsampling.

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

## lpf
Applies a low-pass filter to `signal in`.
- `cutoff` controls the center frequency of the filter.
- `q` controls the resonance of the filter at the cutoff.

## microphone input
Returns the selected `microphone input` device as a signal. **NOTE:** if audio is muted when a microphone is added, audio will resume so that the microphone is created correctly.

## mix
Mixes `signal in 1` and `signal in 2` together using a `crossfade` parameter between 0 and 1. A `crossfade` value of 0.5 will mix the signals together equally, and a `crossfade` value of 0 or 1 will return only the signal at that input.

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

## overdrive
Overdrives `signal in` by `amount`, which expects a range of floats 0 - 1. Higher `amount` values produce more distortion.

## pattern
Generates a customizable wavetable using [Facet](https://github.com/nnirror/facet), a live coding language based in JavaScript. 
- `phase` values between 0 and 1 select a corresponding relative position in the wavetable.
- Every time the `enter` key is pressed, the pattern will reevaluate. Hold the `command` key while pressing `enter` in order to avoid creating a newline.
- **NOTE:** FacetPatterns must be initialized with `_`. So the all `pattern` devices should have code looking like the following examples, which are all valid:
	- `_.noise(16)`
	- `_.ramp(100,30,32).key('c','minor').mtof()`
	- `_.from([20,40,40,80,80,80,80,160,160,160,160,160,160,160,160]).shuffle().palindrome()`

## play
Plays an audio file at `rate` every time `trigger` goes above 0.5. The `sync` outlet signal is the current playback position normalized between 0 and 1. A signal above 0.5 for the `loop` signal will loop file playback.

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
- `size` functions as a coefficient, multiplying all delay line times and expects a range of floats 0 - 1.
- `wet` controls dry/wet balance and expects a range of floats 0 - 1.

## round
Rounds `signal in` to the nearest integer.

## rotator
Rotates the 4 input signals rightwards every time `trigger` goes above 0.5. In other words, `signal in 1` will cyclically move from its initial output position at `signal out 1`, to `signal out 2`, then `signal out 3`, and finally `signal out 4` before wrapping back to `signal out 1` again.

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

## swanramp
Applies a declicking algorithm to the input signal with user control over when to avoid clicks. From the [Cyling '74 RNBO Documentation of swanramp:](https://rnbo.cycling74.com/objects/ref/swanramp~): "Performs click compensation using Miller Puckette's switch-and-ramp technique. When the right inlet receives a positive value, swanramp~ triggers a ramp that starts from the value of the last sample in the left inlet and goes down to zero over the number of samples specified. This ramp is mixed with the input signal to prevent clicks."
  
## times
Multiplies `signal 1` and `signal 2`. 

## tri
Generates a triangle wave between -1 and 1, oscillating at `frequency (hz)` and with configurable `pulsewidth`.

## toggle
Outputs a 0 when the button is `off` and outputs a 1 when the button is `on`. Click the button to switch states.

## wave
Reads through an audio file like a wavetable, with `phase` values between 0 and 1 selecting a corresponding relative position in the audio file.

## wrap
Wraps any values in `signal in 1` below `minimum` or above `maximum`. If the input value exceeds `maximum`, the output will be the amount exceeded plus `minimum` . If the input value is below `minimum`, the output will be the amount below subtracted from `maximum`. 