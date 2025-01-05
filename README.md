# Overview
Wax is a browser-based audio synthesis environment inspired by Max and other data-flow programming systems.

By adding devices to a virtual workspace and connecting them together, you can create custom digital signal processing algorithms.

All devices communicate to each other with audio signals, similar to a modular synthesizer.

As a supplement to the README document, this [walkthrough video](https://youtu.be/1iOWyA3fWJg) demonstrates how Wax works.

If you have any questions, please feel free to reach out to Michael Cella `mjcella@umich.edu` or Anıl Çamcı `acamci@umich.edu`.

# Getting started

Wax runs entirely in the browser. When you load the web page, the virtual workspace is empty except for two `speaker` devices at the bottom.

To view a list of all objects, press the "all devices" button. This will list each device along with a link to its below documentation.

# Examples
In the top-left corner of the web app, there is an `examples` folder containing several pre-patched system states to demonstrate how elements can be connected together. Select any element from the dropdown to load that state.

## Adding devices
Double-click or press 'n' to open the interface for adding a device to the workspace. Then begin typing to find the object you want to add. Press `enter` or click the `add` button to add the device to the workspace.

For device documentation, click the `i` button at the top of the device.

## Creating connections
Creating connections between two devices will create a data flow between them at audio rate, from the output of the `source device` to the input of the `target device`. Device outputs are listed as buttons on the right of the device, and device inputs are listed as buttons on the left.

## Deleting connections
There are two ways to delete a connection. Double-click on a connection deletes it. Single-clicking on a connection will highlight it. Once a connection is highlighted, press `delete` to delete the connection.

## Manipulating devices
Click-drag on the workspace to select multiple devices at once. Selected devices have a bold, white border. Selected devices are draggable to anywhere the workspace.

## Deleting devices
When a device is selected, press `delete` or click the `x` button to delete the device.

## Device parameters
Some devices have text inputs which allow the user to type in values to control the device. These text inputs accept numbers or expressions in [Facet](https://github.com/nnirror/facet), a live coding language based in JavaScript. Press `enter` to transmit the number or expression into the device, or if on a mobile device, press the `regen` button.

**IMPORTANT:** Many parameters are available via both the text input _and_ as an audio rate data flow connection. In this case, the signal input takes precedence, and the corresponding text input will have no effect until the signal is disconnected.

As an example, here are several useful Facet commands, which allow you add tunable randomness to device parameters:
- `choose()`. For example: `choose([1,2,34]) // each time it's regenerated, it will choose either 1,2,3, or 4`
- `rf()`. For example: `rf(-1,1) // random float between -1 and 1`
- `ri()`. For example: `ri(10,60) // random integer between 10 and 60`

## Regenerating device parameters
Some devices have a `regen` button which causes all device parameters to regenerate every time a signal connected to `regen` goes above 0.5. For static numbers, this will have no effect, but if the device parameter is written as Facet code, the resulting can be different each time it's generated.

For example, if you have a `number` device, and you enter `ri(10,1000)` for its `value`, then each time the `regen` signal goes above 0.5, the output from `number` will be a new, random integer between 10 and 1000. If you entered `choose([2,3,4,6,8])` as its `value`, then the output from `number` would be either 2, 3, 4, 6, or 8.

**IMPORTANT:** inputs will not regenerate while the cursor is inside of it (unless you press `[enter]`). After modifying an input, click outside of it to begin regenerating.

## Key combinations
- create new device: `n`
- duplicate selected device(s): `[command] + d`
- delete selected device(s): `delete`
- create number device: `f`
- create comment device: `c`
- create toggle device: `t`
- create slider device: `s`
- create button device: `b`

# Managing state
In Wax, system states can be saved, reloaded, and shared.

## Sharing a state
Press the `share URL` button to copy the system state to your clipboard as a URL. **NOTE:** audio files will not be included and need to be sent separately.

## Saving a state
Press the `save` button to save the system state as a zip file, including all audio files that were loaded.

## Loading state
Press the `load` button to load a previously saved .zip file, including all audio files.

# Locking the workspace
Press the `Lock` button to lock all objects in place and prevent accidental dragging. You can still interact with all UI elements but cannot create and delete connections or objects. This is especially helpful when interacting with UI elements on touchscreen devices.

# Device reference

## absolute
Computes the absolute value of the input signal.

## add
Adds `input 1` to `input 2`.

## envelope
Generates an attack-decay-release envelope every time `trigger in` goes above 0.5.
- `attack (ms)`: the number of milliseconds to reach the envelope peak.
- `decay (ms)`: the number of miliseconds to go from the envelope peak to the `level` value.
- `level`: the maximum value that the envelope reaches.
- `release (ms)`: the number of milliseconds to go from the `level`value to silence.

## allpass
Applies an allpass filter to `input`.
- `delay (ms)` controls the delay of the allpass filter.  

## and
Computes the logical AND of `input 1` `input 2`.

## bandpass
Applies a band-pass filter to `input`.
- `cutoff` controls the center frequency of the filter.
- `q` controls the resonance of the filter at the cutoff. 

## buffer
Loads an audio buffer into the workpace so it can be accessed by the `pattern` object via the `sample()` Facet method. 

## button
Outputs a 1 while the button is pressed and otherwise outputs 0.

## change
Compares the current sample with the previous sample value in `input` and returns 1 if the current sample value increased, -1 if it decreased, and 0 if it stayed the same. `difference` outputs the difference between the current `input` and the `input` 1 sample ago.

## clip
Clips any values in `input 1` below `minimum` or above `maximum` to be equal to `minimum` and `maximum`, respectively. 

## clock
Returns metronomic subdivisions of `tempo (ms)`. Each outlet runs at a different, increasingly faster speed.

## comb
Applies a comb filter effect to `input`. `feedback` expect a range of floats 0 - 1.

## comment
Stores text in the workspace which can be saved and loaded as part of system presets.

## cross
Imparts the spectral envelope of `modulator` onto `carrier`.

## counter
Counts upwards from 0 to `maximum`, incrementing every time `trigger` goes above 0.5. `hit maximum` will output a 1 while the counter is at its maximum and a 0 otherwise.

## declick
Applies a declicking algorithm to `input` with user control over when to avoid clicks. From the [Cyling '74 RNBO Documentation of swanramp:](https://rnbo.cycling74.com/objects/ref/swanramp~): "Performs click compensation using Miller Puckette's switch-and-ramp technique. When the right inlet receives a positive value, swanramp~ triggers a ramp that starts from the value of the last sample in the left inlet and goes down to zero over the number of samples specified. This ramp is mixed with the input signal to prevent clicks."

## delay
Applies a delay effect to `input`, lasting `delay time (ms)` and feeding back based on `feedback`.
- `wet` controls dry/wet balance and expects a range of floats 0 - 1.

## divide
Divides `input 1` and `input 2`.

## downsample
Downsamples `input` by `amount`, which expects a range of floats 0 - 1. Higher `amount` values produce more downsampling.

## drunk
Generates a new value in a random walk of values between 0 and `maximum`, with `step` being the maximum value between each step, every time `trigger` goes above 0.5.

## equals
Computes the logical EQUALS of `input 1` `input 2`.

## fftfilter
Applies a FFT-based bandpass filter to `input`, passing only frequencies between `low` and `high`.

## fftgate
Applies a FFT-based bin threshold gate to `input`, passing only FFT bin frequencies higher than `threshold`. Values for `threshold` are normalized and clipped between 0 and 1.

## fold
Folds any values in `input 1` below `minimum` or above `maximum`. If the input value exceeds `maximum`, the output will be the amount above subtracted from `maximum`.  If the input value is below `minimum`, the output will be the amount below added to from `minimum`.

## granular
Generates grains lasting `size (ms)` from a loaded audio file, starting at the `position` point, which expects a float between 0 - 1. A new grain will generate every time `trigger` goes above 0.5.

## greater
Computes the boolean representation of whether `input 1` is greater than `input 2`.

## highpass
Applies a high-pass filter to `input`.
- `cutoff` controls the center frequency of the filter.
- `q` controls the resonance of the filter at the cutoff.

## hztoms
Converts an input value in `hz` to its equivalent number in `milliseconds`.

## hztosamps
Converts an input value in `hz` to its equivalent number in `samples`.

## input
Returns the first two channels of the browser's default audio input device as a signal. If the microphone has one output channel, that channel will be available on `output 1`.

This feature is experimental because each browser's implementation of the web audio API is different. Some combinations of browser and audio input device may not work. Before loading the page, set the default audio input device for the browser.

**NOTE:** if audio is muted when a microphone is added, audio will resume so that the microphone is created correctly.

## keyboard
Outputs the `frequency` (in Hz) of the selected note. The root note defaults to 60 (middle C) but can be configured to any MIDI note number. Click-drag or touch a key to select a new note.

The `trigger` output generates a 100ms trigger every time a new note is played.

## less
Computes the boolean representation of whether `input 1` is greater than `input 2`.

## limiter
Applies a peak-limiter to `input 1`. 

## lowpass
Applies a low-pass filter to `input`.
- `cutoff` controls the center frequency of the filter.
- `q` controls the resonance of the filter at the cutoff.

## mix
Mixes `input 1` and `input 2` together using a `crossfade` parameter between 0 and 1. A `crossfade` value of 0.5 will mix the signals together equally, and a `crossfade` value of 0 or 1 will return only the signal at that input.

## motion
Outputs two floats between -1 and 1 corresponding to the device's orientation in space.
- The `pitch` outlet returns the device's tilt upwards or downwards: pointing straight up is 1; pointing straight down is -1; and resting flat is 0.
- The `roll` outlet returns the device's rotational position around its front-to-back axis.
- **NOTE:** this device is only available on mobile devices which report device motion data via [DeviceMotionEvents](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events).

## mstohz
Converts an input value in `ms` to its equivalent number in `hz`.

## mstosamps
Converts an input value in `ms` to its equivalent number in `samples`.

## mtof
Converts an input value of a MIDI note number to its corresponding frequency in `hz`.

## modulo
Computes the modulo `operand` of `input`.

## multiply
Multiplies `input 1` and `input 2`. 

## noise
Generates white noise.

## not
Computes the logical NOT of `input 1`.

## number
Returns `value` as a signal.

## or
Computes the logical OR of `input 1` `input 2`.

## overdrive
Overdrives `input` by `amount`, which expects a range of floats 0 - 1. Higher `amount` values produce more distortion.

## output
Connects the audio stream to the computer's selected audio output device on channel `channel`.
**NOTE**: if you change want to use a different audio output device, you will need to reload the page. Make sure to save your state beforehand so you can reload it.

## pattern
Generates a customizable wavetable using [Facet](https://github.com/nnirror/facet), a live coding language based in JavaScript. 
- `phase` values between 0 and 1 select a corresponding relative position in the wavetable. That data is outputted via the `output (phase)` outlet.
- Every time `trigger` goes above 0.5, the entire wavetable will be outputted at audio-rate via the `output (trigger)` outlet.
- Every time the `[ctrl] + enter` key combonation is pressed, the pattern will reevaluate.
- `[ctrl] + f` will reformat the code.
- The `size` outlet returns a signal corresponding to the number of samples in the pattern.
- **NOTE:** FacetPatterns must be initialized with `_`. So the all `pattern` devices should have code looking like the following examples, which are all valid:
	- `_.noise(16)`
	- `_.ramp(100,30,32).key('c','minor').mtof()`
	- `_.from([20,40,40,80,80,80,80,160,160,160,160,160,160,160,160]).shuffle().palindrome()`

## phasor
Generates a phasor between 0 and 1, oscillating at `frequency`.

## pitchshift
Applies a time-domain frequency shift effect of `shift amt` to `input`. A `shift amt` of 2 will be twice as high frequency.

## play
Plays a loaded audio file at `rate` every time `trigger` goes above 0.5.
- The `sync` outlet signal is the current playback position normalized between 0 and 1. A nonzero `loop` input will loop file playback.
- The `start pos` and `end pos` values control the relative start and end point of audio file playback and expect values between 0 and 1.

## pluck
Generates a synthetic string pluck at `frequency` Hz using Karplus-Strong synthesis. `damping` controls how long the string resonates and expects values between 0 and 1.

## print
Displays the current value of `input` every 100ms. Helpful for debugging.

## random
Returns a random number between `minimum` and `maximum`, every time `trigger` goes above 0.5.

## record
Records `input 1` and `input 2` to a stereo audio buffer for `length (ms)` milliseconds.
- A signal that rises above 0.5 in `start/stop` will start the recording, and a signal that falls below 0.5 will stop it. You can use a `toggle` UI element to control `start/stop`.
- To export the last recording, send a signal that rises above 0.5 to `save`. You can use a `button` UI element to control `save`.

## rectangle
Generates a rectangle wave between -1 and 1, oscillating at `frequency` and with configurable `pulsewidth`.

## reverb
Applies a reverb effect to `input`.
- `feedback` controls feedback of the delay lines.
- `size` functions as a coefficient, multiplying all delay line times and expects a range of floats 0 - 1.
- `wet` controls dry/wet balance and expects a range of floats 0 - 1.

## rotator
Rotates the 4 input signals rightwards every time `trigger` goes above 0.5. In other words, `input 1` will cyclically move from its initial output position at `output 1`, to `output 2`, then `output 3`, and finally `output 4` before wrapping back to `output 1` again.

## round
Rounds `input` to the nearest integer.

## samp&hold
Applies a sample-and-hold effect to `input`, holding its value every time `trigger` goes above 0.5.

## sampstohz
Converts an input value in `samples` to its equivalent number in `hz`.

## sampstoms
Converts an input value in `samples` to its equivalent number in `ms`.

## sawtooth
Generates a sawtooth wave between -1 and 1, oscillating at `frequency`. 

## scale
Translates `input` into a different number range.

- `low in` is the minimum value in `input`.
- `high in` is the maximum value in `input`.
- `low out` is the minimum value desired in the output.
- `high out` is the minimum value desired in the output.
- `exponent` scales the output range according to an exponential curve and should be greater than or equal to 1.

## sine
Generates a sine wave between -1 and 1, oscillating at `frequency`. The phase of the sine wave can be modified at signal-rate with `phase`,which will be added to the `frequency` parameter.

## skipper
Decides whether to pass or mute `input` every time `input` goes above 0.1, based on `prob`.

## slider
Outputs a float between 0 and 1. Move the slider to change the offset.

## smooth
Smooths `input` by ramping from its previous value to its new value, ramping up over `up (ms)` and down over `down (ms)`. `exponent` controls the contour of the ramp: at 0, the ramp moves linearly to the new value, and at 1, the ramp moves logarithmically.

## snapshot
Slows `input` down so it only changes once for every `interval (ms)` that passes.

## squareroot
Computes the square root of `input 1`.

## subtract
Subtracts `input 2` from `input 1`.

## toggle
Outputs a 0 when the button is `off` and outputs a 1 when the button is `on`. Click the button to switch states.

## touchpad
Outputs two floats between 0 and 1, corresponding to the selected x/y position in a 2D touchpad.

## triangle
Generates a triangle wave between -1 and 1, oscillating at `frequency` and with configurable `pulsewidth`. The phase of the triangle wave can be modified at signal-rate with `phase`,which will be added to the `frequency` parameter.

## wavetable
Reads through a loaded audio file like a wavetable, with `phase` values between 0 and 1 selecting a corresponding relative position in the audio file.

## wrap
Wraps any values in `input 1` below `minimum` or above `maximum`. If the input value exceeds `maximum`, the output will be the amount exceeded plus `minimum` . If the input value is below `minimum`, the output will be the amount below subtracted from `maximum`. 
- The `size` outlet returns a signal corresponding to the number of samples in the pattern.
