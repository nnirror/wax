class fftshift extends AudioWorkletProcessor {
    static get numberOfInputs() {
        return 2;
    }

    static get numberOfOutputs() {
        return 1;
    }

    static get inputNames() {
        return ['input', 'shiftAmount'];
    }

    static get outputNames() {
        return ['output'];
    }

    static get processorName() {
        return this.name;
    }

    constructor() {
        super();
        this.fftSize = 128;
        this.bufferSize = 128;
        
        // buffers to accumulate samples
        this.realBuffer = new Float32Array(this.fftSize);
        this.imagBuffer = new Float32Array(this.fftSize);

        // track number of samples accumulated
        this.bufferedSamples = 0;
        this.overlapBuffer = new Float32Array(this.fftSize - this.bufferSize);

        // create a Hann window
        this.hannWindow = this.createHannWindow(this.fftSize);

        this.port.postMessage({
            type: 'config',
            inputs: fftshift.numberOfInputs,
            outputs: fftshift.numberOfOutputs,
            inputNames: fftshift.inputNames,
            outputNames: fftshift.outputNames,
            processorName: fftshift.processorName
        });
    }

    // Hann window function
    createHannWindow(size) {
        const window = new Float32Array(size);
        for (let i = 0; i < size; i++) {
            window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
        }
        return window;
    }

    // does FFT bin shifting
    shiftBins(real, imag, shiftAmount) {
        const shiftedReal = new Float32Array(real.length);
        const shiftedImag = new Float32Array(imag.length);

        for (let i = 0; i < real.length; i++) {
            // calculate the new index, wrapping around using modulo
            const newIndex = (i + shiftAmount + real.length) % real.length;
            shiftedReal[newIndex] = real[i];
            shiftedImag[newIndex] = imag[i];
        }

        return { real: shiftedReal, imag: shiftedImag };
    }

    process(inputs, outputs) {
        const inputSignal = inputs[0];
        const shiftSignal = inputs[1];
        const output = outputs[0];

        if (inputSignal && shiftSignal && output) {
            const shiftAmount = shiftSignal[0] && shiftSignal[0][0] ? Math.round(shiftSignal[0][0]) : 0;

            for (let channel = 0; channel < output.length; channel++) {
                const inputChannel = inputSignal[channel];
                const outputChannel = output[channel];

                if (inputChannel && outputChannel) {
                    // accumulate the input signal into the realBuffer
                    this.realBuffer.set(this.overlapBuffer);

                    this.realBuffer.set(inputChannel, this.fftSize - this.bufferSize);
                    this.overlapBuffer.set(this.realBuffer.subarray(this.bufferSize));

                    this.bufferedSamples += this.bufferSize;

                    // process only when we have enough samples
                    if (this.bufferedSamples >= this.fftSize) {
                        // apply windowing to the input
                        for (let i = 0; i < this.fftSize; i++) {
                            this.realBuffer[i] *= this.hannWindow[i];
                            this.imagBuffer[i] = 0.0;
                        }

                        // perform the FFT
                        this.fft(this.realBuffer, this.imagBuffer);

                        // shift the bins
                        const { real: shiftedReal, imag: shiftedImag } = this.shiftBins(this.realBuffer, this.imagBuffer, shiftAmount);

                        // perform the inverse FFT
                        this.ifft(shiftedReal, shiftedImag);

                        // apply windowing to the reconstructed output
                        for (let i = 0; i < this.fftSize; i++) {
                            shiftedReal[i] *= this.hannWindow[i];
                        }

                        // overlap and add for the output
                        for (let i = 0; i < this.bufferSize; i++) {
                            outputChannel[i] = shiftedReal[i] * 2;
                        }

                        // reset the buffered samples
                        this.bufferedSamples = 0;
                    } else {
                        // if not enough samples, output silence
                        outputChannel.fill(0);
                    }
                }
            }
        }

        return true;
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

registerProcessor(fftshift.processorName, fftshift);