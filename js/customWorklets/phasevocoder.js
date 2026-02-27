class phasevocoder extends AudioWorkletProcessor {
    static get numberOfInputs() {
        return 1;
    }

    static get numberOfOutputs() {
        return 1;
    }

    static get inputNames() {
        return ['position'];
    }

    static get outputNames() {
        return ['output'];
    }

    static get processorName() {
        return this.name;
    }

    constructor() {
        super();
        this.fftSize = 2048;
        this.hopSize = this.fftSize / 4;

        this.realBuffer = new Float32Array(this.fftSize);
        this.imagBuffer = new Float32Array(this.fftSize);

        // overlap-add output accumulator
        this.overlapBuffer = new Float32Array(this.fftSize * 2);

        // read head: next index in overlapBuffer to hand to the output
        this.overlapReadHead = 0;

        this.hannWindow = this.createHannWindow(this.fftSize);
        this.olaGain = (2.0 * this.hopSize) / this.fftSize;

        // audio buffer storage
        this.audioBuffer = null;
        this.audioBufferLength = 0;

        // counts samples since the last grain was scheduled
        this.frameCounter = 0;

        this.port.postMessage({
            type: 'config',
            inputs: phasevocoder.numberOfInputs,
            outputs: phasevocoder.numberOfOutputs,
            inputNames: phasevocoder.inputNames,
            outputNames: phasevocoder.outputNames,
            processorName: phasevocoder.processorName
        });

        this.port.onmessage = (event) => {
            if (event.data.type === 'audioBuffer') {
                this.setAudioBuffer(event.data.buffer);
            }
        };
    }

    setAudioBuffer(buffer) {
        this.audioBuffer = buffer;
        this.audioBufferLength = buffer ? buffer.length : 0;
    }

    createHannWindow(size) {
        const w = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
        }
        return w;
    }

    // read a windowed grain from the audio buffer centered on `position` (0-1).
    // writes into this.realBuffer with the Hann window applied.
    readGrain(position) {
        const buf = this.audioBuffer;
        const bufLen = this.audioBufferLength;
        const N = this.fftSize;
        const real = this.realBuffer;
        const win = this.hannWindow;

        if (!buf || bufLen === 0) {
            real.fill(0);
            return;
        }

        // wrap position into [0, 1) so e.g. -0.25 → 0.75, 1.25 → 0.25
        position = position - Math.floor(position);
        const centre = Math.floor(position * (bufLen - 1));
        const start = centre - (N >> 1);

        for (let i = 0; i < N; i++) {
            const idx = start + i;
            real[i] = (idx >= 0 && idx < bufLen ? buf[idx] : 0) * win[i];
        }
    }

    process(inputs, outputs) {
        const positionInput = inputs[0];
        const output = outputs[0];

        if (!output || !output[0]) return true;

        const outputChannel = output[0];
        const blockSize = outputChannel.length;

        const position = (positionInput && positionInput[0] && positionInput[0].length > 0)
            ? positionInput[0][0]
            : 0;

        for (let i = 0; i < blockSize; i++) {
            // schedule a new grain every hopSize samples
            if (this.frameCounter % this.hopSize === 0) {
                this.scheduleGrain(position);
            }
            this.frameCounter++;

            // read next sample from the accumulator
            outputChannel[i] = this.overlapBuffer[this.overlapReadHead] * this.olaGain;
            this.overlapBuffer[this.overlapReadHead] = 0; // clear after consuming
            this.overlapReadHead++;
        }

        // compact the accumulator once the read head has passed the first half
        if (this.overlapReadHead >= this.fftSize) {
            this.overlapBuffer.copyWithin(0, this.overlapReadHead);
            this.overlapBuffer.fill(0, this.overlapBuffer.length - this.overlapReadHead);
            this.overlapReadHead = 0;
        }

        return true;
    }

    scheduleGrain(position) {
        // read + window the grain into realBuffer
        this.readGrain(position);

        // overlap-add into the accumulator starting at the current read head.
        // no FFT phase manipulation
        const N = this.fftSize;
        const base = this.overlapReadHead;
        const buf = this.overlapBuffer;
        const real = this.realBuffer;

        for (let i = 0; i < N; i++) {
            const idx = base + i;
            if (idx < buf.length) {
                buf[idx] += real[i];
            }
        }
    }
}

registerProcessor(phasevocoder.processorName, phasevocoder);
