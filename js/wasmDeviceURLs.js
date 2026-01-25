var wasmDeviceURLs = [
    {
        "fileName": "abs",
        "displayName": "absolute"
    },
    {
        "fileName": "add",
        "displayName": "add (+)"
    },
    {
        "fileName": "adr",
        "displayName": "envelope"
    },
    {
        "fileName": "allpass",
        "displayName": "allpass"
    },
    {
        "fileName": "and",
        "displayName": "and (&&)"
    },
    {
        "fileName": "bpf",
        "displayName": "bandpass"
    },
    {
        "fileName": "buffer",
        "displayName": "buffer"
    },
    {
        "fileName": "button",
        "displayName": "button"
    },
    {
        "fileName": "change",
        "displayName": "change"
    },
    {
        "fileName": "clip",
        "displayName": "clip"
    },
    {
        "fileName": "clock",
        "displayName": "clock"
    },
    {
        "fileName": "newClock",
        "displayName": "newClock"
    },
    {
        "fileName": "comb",
        "displayName": "comb"
    },
    {
        "fileName": "comment",
        "displayName": "comment"
    },
    {
        "fileName": "complexity",
        "displayName": "complexity",
        "worklet": "complexity"
    },
    {
        "fileName": "counter",
        "displayName": "counter"
    },
    {
        "fileName": "cross",
        "displayName": "cross"
    },
    {
        "fileName": "delay",
        "displayName": "delay"
    },
    {
        "fileName": "divide",
        "displayName": "divide (/)"
    },
    {
        "fileName": "downsamp",
        "displayName": "downsample"
    },
    {
        "fileName": "drunk",
        "displayName": "drunk"
    },
    {
        "fileName": "equals",
        "displayName": "equals (==)"
    },
    {
        "fileName": "fgate",
        "displayName": "fftgate"
    },
    {
        "fileName": "ffilter",
        "displayName": "fftfilter"
    },
    {
        "fileName": "fftshift",
        "displayName": "fftshift",
        "worklet": "fftshift"
    },
    {
        "fileName": "fold",
        "displayName": "fold"
    },
    {
        "fileName": "ftom",
        "displayName": "ftom"
    },
    {
        "fileName": "gate",
        "displayName": "gate"
    },
    {
        "fileName": "granular",
        "displayName": "granular"
    },
    {
        "fileName": "greater",
        "displayName": "greater (>)"
    },
    {
        "fileName": "hpf",
        "displayName": "highpass"
    },
    {
        "fileName": "hztoms",
        "displayName": "hztoms"
    },
    {
        "fileName": "hztosamps",
        "displayName": "hztosamps"
    },
    {
        "fileName": "keyboard",
        "displayName": "keyboard"
    },
    {
        "fileName": "less",
        "displayName": "less (<)"
    },
    {
        "fileName": "limi",
        "displayName": "limiter"
    },
    {
        "fileName": "lpf",
        "displayName": "lowpass"
    },
    {
        "fileName": "midicc",
        "displayName": "MIDI cc"
    },
    {
        "fileName": "midinote",
        "displayName": "MIDI note"
    },
    {
        "fileName": "midipitchbend",
        "displayName": "MIDI pitchbend"
    },
    {
        "fileName": "mix",
        "displayName": "mix"
    },
    {
        "fileName": "mstohz",
        "displayName": "mstohz"
    },
    {
        "fileName": "mstosamps",
        "displayName": "mstosamps"
    },
    {
        "fileName": "mtof",
        "displayName": "mtof"
    },
    {
        "fileName": "modulo",
        "displayName": "modulo (%)"
    },
    {
        "fileName": "times",
        "displayName": "multiply (*)"
    },
    {
        "fileName": "noise",
        "displayName": "noise"
    },
    {
        "fileName": "not",
        "displayName": "not (!)"
    },
    {
        "fileName": "number",
        "displayName": "number"
    },
    {
        "fileName": "or",
        "displayName": "or (||)"
    },
    {
        "fileName": "overdrive",
        "displayName": "overdrive"
    },
    {
        "fileName": "output",
        "displayName": "output"
    },
    {
        "fileName": "pattern",
        "displayName": "pattern"
    },
    {
        "fileName": "phasor",
        "displayName": "phasor"
    },
    {
        "fileName": "pitchshift",
        "displayName": "pitchshift"
    },
    {
        "fileName": "play",
        "displayName": "play"
    },
    {
        "fileName": "pluck",
        "displayName": "pluck"
    },
    {
        "fileName": "print",
        "displayName": "print"
    },
    {
        "fileName": "quantizer",
        "displayName": "quantizer"
    },
    {
        "fileName": "random",
        "displayName": "random"
    },
    {
        "fileName": "record",
        "displayName": "record"
    },
    {
        "fileName": "rect",
        "displayName": "rectangle"
    },
    {
        "fileName": "reverb",
        "displayName": "reverb"
    },
    {
        "fileName": "rotator",
        "displayName": "rotator"
    },
    {
        "fileName": "round",
        "displayName": "round"
    },
    {
        "fileName": "sah",
        "displayName": "samp&hold"
    },
    {
        "fileName": "sampstohz",
        "displayName": "sampstohz"
    },
    {
        "fileName": "sampstoms",
        "displayName": "sampstoms"
    },
    {
        "fileName": "saw",
        "displayName": "sawtooth"
    },
    {
        "fileName": "scale",
        "displayName": "scale"
    },
    {
        "fileName": "cycle",
        "displayName": "sine"
    },
    {
        "fileName": "scope",
        "displayName": "scope"
    },
    {
        "fileName": "sequencer",
        "displayName": "sequencer"
    },
    {
        "fileName": "skipper",
        "displayName": "skipper"
    },
    {
        "fileName": "slider",
        "displayName": "slider"
    },
    {
        "fileName": "smooth",
        "displayName": "smooth"
    },
    {
        "fileName": "spectrogram",
        "displayName": "spectrogram"
    },
    {
        "fileName": "speedlim",
        "displayName": "snapshot"
    },
    {
        "fileName": "sqrt",
        "displayName": "squareroot"
    },
    {
        "fileName": "step_trig",
        "displayName": "steptrig"
    },
    {
        "fileName": "stutter",
        "displayName": "stutter"
    },
    {
        "fileName": "subtract",
        "displayName": "subtract (-)"
    },
    {
        "fileName": "switch",
        "displayName": "switch"
    },
    {
        "fileName": "toggle",
        "displayName": "toggle"
    },
    {
        "fileName": "touchpad",
        "displayName": "touchpad"
    },
    {
        "fileName": "tri",
        "displayName": "triangle"
    },
    {
        "fileName": "trigtogate",
        "displayName": "trigtogate"
    },
    {
        "fileName": "wave",
        "displayName": "wavetable"
    },
    {
        "fileName": "wrap",
        "displayName": "wrap"
    },
    {
        "fileName": "microphone-input",
        "displayName": "input"
    }
];