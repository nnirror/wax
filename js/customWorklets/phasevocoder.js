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
        this.hopSize = 512; // 25% overlap
        this.bufferSize = 128;
        
        // buffers for FFT processing
        this.realBuffer = new Float32Array(this.fftSize);
        this.imagBuffer = new Float32Array(this.fftSize);
        this.outputBuffer = new Float32Array(this.fftSize);
        
        // overlap-add buffers
        this.overlapBuffer = new Float32Array(this.fftSize);
        this.previousPhases = new Float32Array(this.fftSize / 2 + 1);
        this.outputPhases = new Float32Array(this.fftSize / 2 + 1);
        
        // audio buffer storage
        this.audioBuffer = null;
        this.audioBufferLength = 0;
        
        // playback state
        this.readPosition = 0;
        this.frameCounter = 0;
        
        // create Hann window
        this.hannWindow = this.createHannWindow(this.fftSize);
        
        // synthesis window (for overlap-add)
        this.synthWindow = this.createHannWindow(this.fftSize);
        
        // track input accumulation
        this.inputBuffer = new Float32Array(this.fftSize);
        this.inputWriteIndex = 0;

        this.port.postMessage({
            type: 'config',
            inputs: phasevocoder.numberOfInputs,
            outputs: phasevocoder.numberOfOutputs,
            inputNames: phasevocoder.inputNames,
            outputNames: phasevocoder.outputNames,
            processorName: phasevocoder.processorName
        });

        // listen for audio buffer data
        this.port.onmessage = (event) => {
            if (event.data.type === 'audioBuffer') {
                this.setAudioBuffer(event.data.buffer);
            }
        };
    }

    setAudioBuffer(buffer) {
        this.audioBuffer = buffer;
        this.audioBufferLength = buffer ? buffer.length : 0;
        this.readPosition = 0;
    }

    // create Hann window function
    createHannWindow(size) {
        const window = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
        }
        return window;
    }

    // read audio data from buffer at given position
    readFromBuffer(position, output, length) {
        if (!this.audioBuffer || this.audioBufferLength === 0) {
            output.fill(0);
            return;
        }

        // clamp position to valid range
        position = Math.max(0, Math.min(1, position));
        const startIndex = Math.floor(position * (this.audioBufferLength - length));

        for (let i = 0; i < length; i++) {
            const index = startIndex + i;
            if (index >= 0 && index < this.audioBufferLength) {
                output[i] = this.audioBuffer[index];
            } else {
                output[i] = 0;
            }
        }
    }

    process(inputs, outputs) {
        const positionInput = inputs[0];
        const output = outputs[0];

        if (!output || !output[0]) {
            return true;
        }

        const outputChannel = output[0];
        const blockSize = outputChannel.length;
        
        // get position (0-1) from input, default to 0 if no input
        const position = (positionInput && positionInput[0] && positionInput[0][0]) ? positionInput[0][0] : 0;

        // process each sample in the block
        for (let i = 0; i < blockSize; i++) {
            // output from overlap buffer
            outputChannel[i] = this.overlapBuffer[0] * 0.5; // scale down to prevent clipping
            
            // shift overlap buffer by one sample
            for (let j = 0; j < this.overlapBuffer.length - 1; j++) {
                this.overlapBuffer[j] = this.overlapBuffer[j + 1];
            }
            this.overlapBuffer[this.overlapBuffer.length - 1] = 0;
            
            // process new frame every hopSize samples
            if (this.frameCounter % this.hopSize === 0) {
                this.processFrame(position);
            }
            
            this.frameCounter++;
        }

        return true;
    }
    
    processFrame(position) {
        // read audio data from buffer at the specified position
        this.readFromBuffer(position, this.realBuffer, this.fftSize);

        // apply analysis window
        for (let i = 0; i < this.fftSize; i++) {
            this.realBuffer[i] *= this.hannWindow[i];
            this.imagBuffer[i] = 0.0;
        }

        // perform FFT
        this.fft(this.realBuffer, this.imagBuffer);

        // phase vocoder processing
        this.processPhases(this.realBuffer, this.imagBuffer);

        // perform inverse FFT
        this.ifft(this.realBuffer, this.imagBuffer);

        // apply synthesis window and overlap-add
        for (let i = 0; i < this.fftSize; i++) {
            this.realBuffer[i] *= this.synthWindow[i];
            this.overlapBuffer[i] += this.realBuffer[i];
        }
    }

    // process phases for phase vocoder effect
    processPhases(real, imag) {
        const numBins = this.fftSize / 2 + 1;
        const expectedPhaseAdvance = (2 * Math.PI * this.hopSize) / this.fftSize;

        for (let bin = 0; bin < numBins; bin++) {
            // calculate magnitude and phase
            const magnitude = Math.sqrt(real[bin] * real[bin] + imag[bin] * imag[bin]);
            const phase = Math.atan2(imag[bin], real[bin]);

            // calculate phase difference
            let phaseDiff = phase - this.previousPhases[bin];
            this.previousPhases[bin] = phase;

            // wrap phase difference to [-π, π]
            while (phaseDiff > Math.PI) phaseDiff -= 2 * Math.PI;
            while (phaseDiff < -Math.PI) phaseDiff += 2 * Math.PI;

            // calculate instantaneous frequency
            const instantaneousFreq = bin * expectedPhaseAdvance + phaseDiff;

            // update output phase
            this.outputPhases[bin] += instantaneousFreq;

            // convert back to real and imaginary
            real[bin] = magnitude * Math.cos(this.outputPhases[bin]);
            imag[bin] = magnitude * Math.sin(this.outputPhases[bin]);
            
            // mirror for conjugate symmetry (except DC and Nyquist)
            if (bin > 0 && bin < this.fftSize - bin) {
                real[this.fftSize - bin] = real[bin];
                imag[this.fftSize - bin] = -imag[bin];
            }
        }
    }

    // Cooley-Tukey FFT implementation
    fft(real, imag) {
        const N = real.length;
        const PI2 = -2 * Math.PI;

        let n, mmax, m, mstep, j;

        // bit-reversal permutation
        j = 0;
        for (n = 0; n < N - 1; n++) {
            if (n < j) {
                [real[n], real[j]] = [real[j], real[n]];
                [imag[n], imag[j]] = [imag[j], imag[n]];
            }
            m = N >> 1;
            while (m >= 1 && j >= m) {
                j -= m;
                m >>= 1;
            }
            j += m;
        }

        // Danielson-Lanczos section
        mstep = 1;
        while (N > mstep) {
            mmax = mstep << 1;
            const theta = PI2 / mmax;
            let wr = 1.0;
            let wi = 0.0;

            const wpr = Math.cos(theta);
            const wpi = Math.sin(theta);

            for (m = 0; m < mstep; m++) {
                for (n = m; n < N; n += mmax) {
                    const i = n + mstep;
                    const tr = wr * real[i] - wi * imag[i];
                    const ti = wi * real[i] + wr * imag[i];

                    real[i] = real[n] - tr;
                    imag[i] = imag[n] - ti;
                    real[n] += tr;
                    imag[n] += ti;
                }

                const wtmp = wr;
                wr = wr * wpr - wi * wpi;
                wi = wi * wpr + wtmp * wpi;
            }
            mstep = mmax;
        }
    }

    // Cooley-Tukey IFFT implementation
    ifft(real, imag) {
        const N = real.length;

        // conjugate for IFFT
        for (let i = 0; i < N; i++) imag[i] = -imag[i];

        // perform FFT
        this.fft(real, imag);

        // conjugate again and scale by N
        for (let i = 0; i < N; i++) {
            real[i] = real[i] / N;
            imag[i] = -imag[i] / N;
        }
    }
}

registerProcessor(phasevocoder.processorName, phasevocoder);