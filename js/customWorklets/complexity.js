class complexity extends AudioWorkletProcessor {
    static get numberOfInputs() {
        return 1;
    }

    static get numberOfOutputs() {
        return 1;
    }

    static get inputNames() {
        return ['input'];
    }

    static get outputNames() {
        return ['output'];
    }

    static get processorName() {
        return this.name;
    }

    constructor() {
        super();
        this.counter = 0;
        this.lastcomplexity = 0;

        this.port.postMessage({
            type: 'config',
            inputs: complexity.numberOfInputs,
            outputs: complexity.numberOfOutputs,
            inputNames: complexity.inputNames,
            outputNames: complexity.outputNames,
            processorName: complexity.processorName
        });
    }

    process(inputs, outputs) {
        const inputSignal = inputs[0];
        const output = outputs[0];

        if (inputSignal && output) {
            for (let channel = 0; channel < output.length; channel++) {
                const inputChannel = inputSignal[channel];
                const outputChannel = output[channel];

                if (inputChannel && outputChannel) {
                    // calculate complexity with windowing every 4th block
                    if (this.counter % 4 === 0) {
                        const windowedSignal = inputChannel.map(
                            (sample, index) => sample * this.hannWindow(index, inputChannel.length)
                        );
                        this.lastcomplexity = this.calculatecomplexity(windowedSignal);
                    }

                    // fill the entire block with the last calculated complexity
                    outputChannel.fill(this.lastcomplexity);
                }
            }
        }

        this.counter++;
        return true;
    }

    hannWindow(index, length) {
        // calculate Hann window value for a given sample
        return 0.5 * (1 - Math.cos((2 * Math.PI * index) / (length - 1)));
    }

    calculatecomplexity(audioData) {
        const quantizationLevels = 64;
        const quantized = audioData.map(value => Math.floor((value + 1) * ((quantizationLevels - 1) / 2)));

        return this.nsrps(quantized);
    }

    nsrps(sequence) {
        const originalLength = sequence.length;
        let iteration = 0;
        let maximumIterations = originalLength > 1 ? originalLength - 1 : 1;

        while (sequence.length > 1) {
            const pairFreq = {};
            for (let i = 0; i < sequence.length - 1; i++) {
                const pair = `${sequence[i]}-${sequence[i + 1]}`;
                pairFreq[pair] = (pairFreq[pair] || 0) + 1;
            }

            let maxPair = '';
            let maxFreq = 0;
            for (const pair in pairFreq) {
                if (pairFreq[pair] > maxFreq) {
                    maxFreq = pairFreq[pair];
                    maxPair = pair;
                }
            }

            if (maxPair === '') break;

            const newSymbol = iteration;
            const newSequence = [];
            for (let i = 0; i < sequence.length; i++) {
                if (i < sequence.length - 1 && `${sequence[i]}-${sequence[i + 1]}` === maxPair) {
                    newSequence.push(newSymbol);
                    i++;
                } else {
                    newSequence.push(sequence[i]);
                }
            }

            sequence = newSequence;
            iteration++;
        }

        const normalizedcomplexity = iteration / maximumIterations;
        return normalizedcomplexity;
    }
}

registerProcessor(complexity.processorName, complexity);