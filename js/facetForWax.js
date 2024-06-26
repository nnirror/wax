const SAMPLE_RATE = 44100;
const NYQUIST = SAMPLE_RATE / 2;

class FacetPattern {
  constructor (name) {
    this.name = name ? name : Math.random();
    this.current_iteration_number = 0;
    this.current_slice_number = 0;
    this.current_total_slices = 0;
    this.current_total_iterations = 0;
    this.set_pattern_name_after_evaluation = false;
    this.data = [];
  }

  set ( pattern_name ) {
    this.set_pattern_name_after_evaluation = pattern_name;
    return this;
  }

  get ( pattern_name) {
    if (stored_patterns[pattern_name] == undefined) {
      throw `pattern not found: ${pattern_name}`;
    }
    this.data = stored_patterns[pattern_name];
    return this;
  }

  // BEGIN generator operations
  binary (number,sequence_length) {
    let num = Math.round(Math.abs(number));
    let binary = (num % 2).toString();
    for (; num > 1; ) {
        num = parseInt(num / 2);
        binary =  (num % 2) + (binary);
    }
    if (sequence_length) {
      sequence_length = Math.round(Math.abs(sequence_length));
      binary = binary.substring(0,sequence_length);
      if (binary.length < sequence_length) {
        let zeroes_to_add = sequence_length - binary.length;
        for (var i = 0; i < zeroes_to_add; i++) {
          binary = 0 + binary;
        }
      }
    }
    binary = binary.split('');
    for (var i = 0; i < binary.length; i++) {
      binary[i] = Number(binary[i]);
    }
    this.data = binary;
    return this;
  }

  envelope(env_data) {
    if ( Array.isArray(env_data) === false ) {
      throw `input to envelope must be an array; type found: ${typeof env_data}`;
    }
    if ( env_data.length % 3 != 0 ) {
      throw `input to envelope must be an array evenly disible into groups of three; total length: ${typeof env_data.length}`;
    }
    let env_sequence = new FacetPattern();
    let from, to, duration;
    for (var i = 0; i < env_data.length; i+=3) {
      from = Math.round(Math.abs(Number(env_data[i])));
      to = Math.round(Math.abs(Number(env_data[i+1])));
      duration = Math.round(Math.abs(Number(env_data[i+2])));
      env_sequence.append(new FacetPattern().ramp(from,to,duration));
    }
    this.data = env_sequence.data;
    return this;
  }

  cosine(frequencies, length = SAMPLE_RATE, sampleRate = SAMPLE_RATE, fade_in_and_out = true) {
    let output = [];
    if (typeof frequencies == 'number' || Array.isArray(frequencies) === true) {
        frequencies = new FacetPattern().from(frequencies);
    }
    length = Math.round(length);
    frequencies.size(length);
    let phase = 0;
    for (let i = 0; i < length; i++) {
        let t = i / sampleRate;
        let currentFrequency = frequencies.data[i];
        output[i] = Math.cos(phase);
        phase += 2 * Math.PI * currentFrequency / sampleRate;
        if (phase >= 2 * Math.PI) {
            phase -= 2 * Math.PI;
        }
    }
    this.data = output;
    if ( fade_in_and_out == true ) {
      this.fadeoutSamples(Math.round((SAMPLE_RATE/1000)*30));
      this.fadeinSamples(Math.round((SAMPLE_RATE/1000)*30));
    }
    return this;
  }

  from (list) {
    if ( typeof list == 'number' ) {
      list = [list];
    }
    if (!list) {
      list = [];
    }
    this.data = list;
    return this;
  }

  drunk (length, intensity = 0.1, d = Math.random() ) {
    let drunk_sequence = [];
    length = Math.abs(Number(length));
    if (length < 1 ) {
      length = 1;
    }
    for (var i = 0; i < length; i++) {
      let amount_to_add = Math.random() * Number(intensity);
      if ( Math.random() < 0.5 ) {
        amount_to_add *= -1;
      }
      d += amount_to_add;
      if ( d < 0 ) {
        d = 0;
      }
      if ( d > 1 ) {
        d = 1;
      }
      drunk_sequence[i] = d;
    }
    this.data = drunk_sequence;
    return this;
  }

  euclid (pulses, steps) {
    if (pulses >= steps ) {
      throw `argument 1 to euclid() must be smaller than argument 2`;
    }
    pulses = Math.abs(Math.floor(Number(pulses)));
    steps = Math.abs(Math.floor(Number(steps)));
    let sequence = [];
    let counts = new Array(pulses).fill(1);
    let remainders = [];
    remainders = new Array(steps - pulses).fill(0);
    let divisor = Math.floor(steps / pulses);
    let max_iters = 100;
    let current_iter = 0;
    while (true) {
        for (let i = 0; i < remainders.length; i++) {
            counts.push(divisor);
        }
        if (remainders.length <= 1 || current_iter >= max_iters ) {
            break;
        }
        steps = remainders.length;
        pulses = counts.length - steps;
        remainders = counts.splice(pulses);
        divisor = Math.floor(steps / pulses);
        current_iter++;
    }
    for (let i = 0; i < counts.length; i++) {
        for (let j = 0; j < counts[i]; j++) {
            sequence.push(1);
        }
        if (i < remainders.length) {
            for (let j = 0; j < remainders[i]; j++) {
                sequence.push(0);
            }
        }
    }
    this.data = sequence;
    return this;
  }

  primes(n, offset = 2, skip = 1) {
    n = Math.abs(Math.floor(Number(n)));
    if ( n == 0 ) {
      return this;
    }
    const primes = [];
    let num = 2;
    let skipped = 0;
    while (primes.length < n) {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        } 
        if (isPrime && num >= offset) {
            if (skipped === skip) {
                primes.push(num);
                skipped = 0;
            } else {
                skipped++;
            }
        }
        num++;
    }
    this.data = primes;
    return this;
  }


  noise (length) {
    let noise_sequence = [];
    length = Math.abs(Math.round(Number(length)));
    if (length < 1 ) {
      length = 1;
    }
    for (var i = 0; i < length; i++) {
      noise_sequence[i] = Math.random() * 2 - 1;
    }
    this.data = noise_sequence;
    return this;
  }

  normalize () {
    // maps any pattern across a full 0.0 - 1.0 range
    let normalized_sequence = [];
    let min = Math.min.apply(Math, this.data);
    let max = Math.max.apply(Math, this.data);
    for (const [key, step] of Object.entries(this.data)) {
      normalized_sequence[key] = (step - min) / (max - min);
    }
    this.data = normalized_sequence;
    return this;
  }

  phasor(frequencies, duration = SAMPLE_RATE, sampleRate = SAMPLE_RATE, fade_in_and_out = true) {
    if (typeof frequencies == 'number' || Array.isArray(frequencies) === true) {
        frequencies = new FacetPattern().from(frequencies);
    }
    duration = Math.round(duration);
    frequencies.size(duration);
    let wave = [];
    for (let i = 0; i < duration; i++) {
        let frequency = frequencies.data[i];
        let samplesPerCycle = sampleRate / frequency;
        let t = i / samplesPerCycle;
        wave[i] = t - Math.floor(t);
    }
    this.data = wave;
    if ( fade_in_and_out == true ) {
      this.fadeoutSamples(Math.round((SAMPLE_RATE/1000)*30));
      this.fadeinSamples(Math.round((SAMPLE_RATE/1000)*30));
    }
    return this;
  }

  ramp (from, to, size = 128 ) {
    let ramp_sequence = [];
    from = Number(from);
    to = Number(to);
    size = Math.abs(Number(size));
    if ( size < 1 ) {
      size = 1;
    }
    let amount_to_add = parseFloat(Math.abs(to - from) / size);
    if ( to < from ) {
      amount_to_add *= -1;
    }
    for (var i = 0; i < size; i++) {
      ramp_sequence[i] = from;
      from += amount_to_add;
    }
    this.data = ramp_sequence;
    return this;
  }

  rect (frequencies, duration = SAMPLE_RATE, pulseWidth = 0.5, sampleRate = SAMPLE_RATE, fade_in_and_out = true) {
    if (typeof frequencies == 'number' || Array.isArray(frequencies) === true) {
        frequencies = new FacetPattern().from(frequencies);
    }
    duration = Math.round(duration);
    frequencies.size(duration);
    let wave = [];
    let amplitude = 1;
    for (let i = 0; i < duration; i++) {
        let frequency = frequencies.data[i];
        let samplesPerCycle = sampleRate / frequency;
        let t = i / samplesPerCycle;
        wave[i] = (t - Math.floor(t) < pulseWidth) ? amplitude : -amplitude;
    }
    this.data = wave;
    if ( fade_in_and_out == true ) {
      this.fadeoutSamples(Math.round((SAMPLE_RATE/1000)*30));
      this.fadeinSamples(Math.round((SAMPLE_RATE/1000)*30));
    }
    return this;
}

  silence (length) {
    length = Math.abs(Math.floor(length));
    this.data = new Array(length).fill(0);
    return this;
  }


  sine (frequencies, length = SAMPLE_RATE, fade_in_and_out = false ) {
    let output = [];
    if ( typeof frequencies == 'number' || Array.isArray(frequencies) === true ) {
      frequencies = new FacetPattern().from(frequencies);
    }
    length = Math.round(length);
    frequencies.size(length);
    let phase = 0;
    for (let i = 0; i < length; i++) {
        let t = i / SAMPLE_RATE;
        let currentFrequency = frequencies.data[i];
        output[i] = Math.sin(phase);
        phase += 2 * Math.PI * currentFrequency / SAMPLE_RATE;
        if (phase >= 2 * Math.PI) {
            phase -= 2 * Math.PI;
        }
    }
    this.data = output;
    if ( fade_in_and_out == true ) {
      this.fadeoutSamples(Math.round((SAMPLE_RATE/1000)*30));
      this.fadeinSamples(Math.round((SAMPLE_RATE/1000)*30));
    }
    return this;
  }

  circle(frequencies, length = SAMPLE_RATE, sampleRate = SAMPLE_RATE) {
    let output = [];
    if (typeof frequencies == 'number' || Array.isArray(frequencies) === true) {
        frequencies = new FacetPattern().from(frequencies);
    }
    length = Math.round(length);
    frequencies.size(length);
    let phase = 0;
    for (let i = 0; i < length; i++) {
        let t = i / sampleRate;
        let currentFrequency = frequencies.data[i];
        let x = phase / (2 * Math.PI);
        let y;
        if (x <= 0.5) {
            y = Math.sqrt(1 - (2 * (0.5 - x)) * (2 * (0.5 - x)));
        } else {
            y = Math.sqrt(1 - (2 * (x - 0.5)) * (2 * (x - 0.5)));
        }
        output[i] = y;
        phase += 2 * Math.PI * currentFrequency / sampleRate;
        if (phase >= 2 * Math.PI) {
            phase -= 2 * Math.PI;
        }
    }
    this.data = output;
    return this;
  }

  spiral (length, angle_degrees = 360/length, angle_phase_offset = 0) {
    angle_phase_offset = Math.abs(Number(angle_phase_offset));
    let spiral_sequence = [], i = 1, angle = 360 * angle_phase_offset;
    angle_degrees = Math.abs(Number(angle_degrees));
    length = Math.abs(Number(length));
    if ( length < 1 ) {
      length = 1;
    }
    while ( i <= length ) {
      angle += angle_degrees;
      if (angle >= 360) {
        angle = Math.abs(360 - angle);
      }
      // convert degrees back to radians, and then to a 0. - 1. range
      spiral_sequence.push( (angle * (Math.PI/180) ) / (Math.PI * 2) );
      i++;
    }
    this.data = spiral_sequence;
    return this;
  }

  square (frequencies, duration = SAMPLE_RATE, sampleRate = SAMPLE_RATE) {
    if (typeof frequencies == 'number' || Array.isArray(frequencies) === true) {
        frequencies = new FacetPattern().from(frequencies);
    }
    duration = Math.round(duration);
    frequencies.size(duration);
    let wave = [];
    let amplitude = 1;
    let phase = 0;
    for (let i = 0; i < duration; i++) {
        let frequency = frequencies.data[i];
        wave[i] = (phase < 0.5) ? amplitude : -amplitude;
        phase += frequency / sampleRate;
        phase -= Math.floor(phase);
    }
    this.data = wave;
    return this;
  }
  
  tri (frequencies, duration = SAMPLE_RATE, sampleRate = SAMPLE_RATE, fade_in_and_out = true ) {
    if (typeof frequencies == 'number' || Array.isArray(frequencies) === true) {
        frequencies = new FacetPattern().from(frequencies);
    }
    duration = Math.round(duration);
    frequencies.size(duration);
    let wave = [];
    let amplitude = 1;
    let phase = 0;
    for (let i = 0; i < duration; i++) {
        let frequency = frequencies.data[i];
        wave[i] = 2 * amplitude * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - amplitude;
        phase += frequency / sampleRate;
        phase -= Math.floor(phase);
    }
    this.data = wave;
    if ( fade_in_and_out == true ) {
      this.fadeoutSamples(Math.round((SAMPLE_RATE/1000)*30));
      this.fadeinSamples(Math.round((SAMPLE_RATE/1000)*30));
    }
    return this;
  }

  truncate (length) {
    if ( Number(length) <= 0 ) {
      return [];
    }
    this.data = this.data.slice(0, Number(length));
    return this;
  }

  turing (length) {
    length = Math.abs(Number(length));
    if (length < 1 ) {
      length = 1;
    }
    let turing_sequence = this.noise(length).scale(0,1).round();
    this.data = turing_sequence.data;
    return this;
  }
  // END generator operations

  // BEGIN modulator operations
  abs () {
    let abs_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      abs_sequence[key] = Math.abs(step);
    }
    this.data = abs_sequence;
    return this;
  }

  add (sequence2, match_sizes = true) {
    if ( typeof sequence2 == 'number' || Array.isArray(sequence2) === true ) {
      sequence2 = new FacetPattern().from(sequence2);
    }
    let out = [];
    if (match_sizes != false) {
      let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
      for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
        out[key] = same_size_arrays[0].data[key] + same_size_arrays[1].data[key];
      }
    }
    else {
      if (this.data.length >= sequence2.data.length) {
        for (const [key, step] of Object.entries(this.data)) {
          if (isNaN(sequence2.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step + sequence2.data[key];
          }
        }
      }
      else {
        for (const [key, step] of Object.entries(sequence2.data)) {
          if (isNaN(this.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step + this.data[key];
          }
        }
      }
    }
    this.data = out;
    this.fixnan();
    return this;
  }

  and (sequence2, match_sizes = true) {
    if ( !this.isFacetPattern(sequence2) ) {
      throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
    }
    let out = [];
    if (match_sizes != false) {
      let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
      for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
        out[key] = (same_size_arrays[0].data[key] != 0) && (same_size_arrays[1].data[key] != 0);
      }
    }
    else {
      if (this.data.length >= sequence2.data.length) {
        for (const [key, step] of Object.entries(this.data)) {
          if (isNaN(sequence2.data[key])) {
            out[key] = (step != 0);
          }
          else {
            out[key] = (step != 0) && (sequence2.data[key] != 0);
          }
        }
      }
      else {
        for (const [key, step] of Object.entries(sequence2.data)) {
          if (isNaN(this.data[key])) {
            out[key] = (step != 0);
          }
          else {
            out[key] = (step != 0) && (this.data[key] != 0);
          }
        }
      }
    }
    this.data = out.map(bool => bool ? 1 : 0);
    return this;
  }

  bitshift (shift = 16) {
    shift = Math.abs(Math.floor(Number(shift))) % 32;
    let min = Math.min.apply(Math, this.data);
    let max = Math.max.apply(Math, this.data);
    this.scale(0,1000000).round();
    let result = [];
    for (let i = 0; i < this.data.length; i++) {
        this.data[i] = parseInt(this.data[i]);
        result.push((this.data[i] << shift) | (this.data[i] >>> (32 - shift)));
    }
    this.data = result;
    this.scale(min, max);
    return this;
  }

  key (key_letter = "C", key_scale = "major") {
    let chroma_key = this.parseKeyAndScale(key_letter,key_scale);
    // check the modulo 12 of each variable. if it's 0, move it up 1 and try again. try 12 times then quit
    let key_sequence = [];
    for (let [k, step] of Object.entries(this.data)) {
      if (step < 0) {
        key_sequence.push(-1);
        continue;
      }
      step = Math.round(step);
      let key_found = false, i = 0;
      while ( key_found == false && i < 12 ) {
        if ( chroma_key[step%12] == 1 ) {
          // in key now
          key_found = true;
          key_sequence.push(step);
          break;
        }
        else {
          // not yet in key
          step += 1;
        }
        i++;
      }
      if ( key_found == false ) {
        key_sequence.push(-1);
      }
    }
    this.key_scale = key_scale;
    this.key_letter = key_letter;
    this.data = key_sequence;
    return this;
  }

  append (sequence2) {
    if ( typeof sequence2 == 'number' || Array.isArray(sequence2) === true ) {
      sequence2 = new FacetPattern().from(sequence2);
    }
    if ( !this.isFacetPattern(sequence2) ) {
      throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
    }
    this.data = this.data.concat(sequence2.data);
    return this;
  }

  prepend(sequence2) {
    if ( typeof sequence2 == 'number' || Array.isArray(sequence2) === true ) {
      sequence2 = new FacetPattern().from(sequence2);
    }
    if ( !this.isFacetPattern(sequence2) ) {
      throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
    }
    this.data = [...sequence2.data, ...this.data];
    this.flatten();
    return this;
  }

  at (position, value) {
    let replace_position = Math.round(position * (this.data.length-1));
    this.data[replace_position] = value;
    return this;
  }

  changed () {
    let changed_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( key == 0 ) {
        if ( step == this.data[this.data.length - 1]) {
          changed_sequence[key] = 0;
        }
        else {
          changed_sequence[key] = 1;
        }
      }
      else {
        if ( step == this.data[key - 1]) {
          changed_sequence[key] = 0;
        }
        else {
          changed_sequence[key] = 1;
        }
      }
    }
    this.data = changed_sequence;
    return this;
  }

  chaos (sequence2, iterations = 100, cx = 0, cy = 0) {
    if ( !this.isFacetPattern(sequence2) ) {
      throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
    }
    let out = [];
    let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
    for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
      out[key] = this.chaosInner(same_size_arrays[0].data[key],same_size_arrays[1].data[key],cx,cy,iterations);
    }
    this.data = out;
    return this;
  }

  chaosInner (cx,cy,zx,zy,iterations) {
    let n = 0, px = 0, py = 0, d = 0;
    while (n < iterations) {
      px = (zx*zx) - (zy*zy);
      py = 2 * zx * zy;
      zx = px + cx;
      zy = py + cy;
      d = Math.sqrt((zx*zx)+(zy*zy));
      if ( d > 2 ) {
        break;
      }
      n += 1;
    }
    return Math.abs(1 - (n/iterations));
  }

  clip (min, max) {
    if (!min) {
      min = 0;
    }
    if (!max) {
      max = 0;
    }
    let clipped_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( step < min ) {
        clipped_sequence[key] = Number(min);
      }
      else if ( step > max ) {
        clipped_sequence[key] = Number(max);
      }
      else {
        clipped_sequence[key] = step;
      }
    }
    this.data = clipped_sequence;
    return this;
  }

  crush(bits, reductionFactor = 1) {
    if (typeof bits == 'number' || Array.isArray(bits) === true) {
        bits = new FacetPattern().from(bits);
    }
    if (typeof reductionFactor == 'number' || Array.isArray(reductionFactor) === true) {
        reductionFactor = new FacetPattern().from(reductionFactor);
    }
    bits.round().abs().replace(0,1).size(this.data.length);
    reductionFactor.round().abs().replace(0,1).size(this.data.length);
    let wave = [];
    let i = 0;
    while (i < this.data.length) {
        let step = Math.pow(2, bits.data[i]);
        let value = Math.round(this.data[i] * step) / step;
        let currentReductionFactor = reductionFactor.data[i];
        for (let j = 0; j < currentReductionFactor; j++) {
            wave[i + j] = value;
        }
        i += currentReductionFactor;
    }
    this.data = wave;
    return this;
}

waveformSample(waveform, phase) {
  switch (waveform) {
      case 0:
          return Math.sin(phase);
      case 1:
          return phase % (2 * Math.PI) < Math.PI ? 1 : -1;
      case 2:
          return 1 - 4 * Math.abs(Math.round(phase / (2 * Math.PI)) - phase / (2 * Math.PI));
      case 3:
          return 2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5));
      default:
        return Math.sin(phase);
  }
}

  gate(threshold, attackSamples, releaseSamples) {
    attackSamples = Math.abs(Math.floor(Number(attackSamples)));
    releaseSamples = Math.abs(Math.floor(Number(releaseSamples)));
    threshold = Math.abs(threshold);
    let gateOn = false;
    let attackCounter = 0;
    let releaseCounter = 0;
    let gatedSignal = this.data.map(sample => {
        if (Math.abs(sample) < threshold && !gateOn) {
            attackCounter++;
            if (attackCounter >= attackSamples) {
                gateOn = true;
                releaseCounter = 0;
            }
        } else if (Math.abs(sample) >= threshold) {
            attackCounter = 0;
        } else if (gateOn && releaseCounter < releaseSamples) {
            releaseCounter++;
        } else if (gateOn && releaseCounter >= releaseSamples) {
            gateOn = false;
        }
        return gateOn ? 0 : sample;
    });
    this.data = gatedSignal;
    return this;
}

  comb (delaySamples = SAMPLE_RATE / 100, feedforward = 0.5, feedback = 0.5) {
    feedback = Math.min(Math.max(feedback, 0), 0.98);
    feedforward = Math.min(Math.max(feedforward, 0), 0.98);
    if (typeof delaySamples == 'number' || Array.isArray(delaySamples) === true) {
        delaySamples = new FacetPattern().from(delaySamples);
    }
    let maxDelaySamples = Math.round(Math.max(...delaySamples.data));
    delaySamples.size(this.data.length).round();
    let maxFeedbackIterations = Math.ceil(Math.log(0.001) / Math.log(feedback));
    let outputLength = this.data.length + maxDelaySamples * maxFeedbackIterations;
    let output = new Array(outputLength).fill(0);
    for (let i = 0; i < outputLength; i++) {
        let delaySamplesIndex = Math.floor((i / this.data.length) * delaySamples.data.length);
        let currentDelaySamples = Math.round(Math.abs(Number(delaySamples.data[delaySamplesIndex])));
        let delayedIndex = i - currentDelaySamples;
        let delayedInputSample = delayedIndex < 0 ? 0 : this.data[delayedIndex];
        let delayedOutputSample = delayedIndex < 0 ? 0 : output[delayedIndex];
        if (i < this.data.length) {
            output[i] = feedforward * this.data[i] + 1 * delayedInputSample + feedback * delayedOutputSample;
        } else {
            output[i] = feedback * delayedOutputSample;
        }
    }
    this.data = output;
    this.fixnan();
    this.trim();
    return this;
  }

  delay (delayAmount, feedback = 0.5) {
    feedback = Math.min(Math.max(feedback, 0), 0.999);
    if (typeof delayAmount == 'number' || Array.isArray(delayAmount) === true) {
        delayAmount = new FacetPattern().from(delayAmount);
    }
    let maxDelayAmount = Math.round(Math.max(...delayAmount.data));
    feedback *= (1-(maxDelayAmount / SAMPLE_RATE))*0.975;
    delayAmount.size(this.data.length).round();
    if ( maxDelayAmount > (SAMPLE_RATE/2) ) {
      feedback *= 0.75;
    }
    let maxFeedbackIterations = Math.ceil(Math.log(0.001) / Math.log(feedback));
    let delayedArray = new Array(Math.max(0, this.data.length + maxDelayAmount * maxFeedbackIterations)).fill(0);
    for (let i = 0; i < maxFeedbackIterations; i++) {
        let gain = Math.pow(feedback, i);
        for (let j = 0; j < this.data.length; j++) {
            let delayAmountIndex = Math.floor((j / this.data.length) * delayAmount.data.length);
            let currentDelayAmount = Math.round(Math.abs(Number(delayAmount.data[delayAmountIndex])));
            delayedArray[j + i * currentDelayAmount] += this.data[j] * gain;
        }
    }
    this.data = delayedArray;
    return this;
  }

  // ratio is a float between 0 and 1 corresponding to n:1 so 0.5 would be 2:1, 0.2 would be 5:1 tc
  // threshold is the sample amplitude at which compression kicks in
  // attacktime and release time are expressed as relations to a second, so 0.1 would be 1/10th of a second
  // 
  compress (ratio, threshold, attackTime, releaseTime) {
    let initial_maximum_value = this.getMaximumValue();
    let attack = Math.pow(0.01, 1.0 / (attackTime * SAMPLE_RATE));
    let release = Math.pow(0.01, 1.0 / (releaseTime * SAMPLE_RATE));
    let envelope = 0;
    let gain = 1;
    let compressedAudio = [];
    let maximum_value = Math.max(...this.data);

    for (let i = 0; i < this.data.length; i++) {
        let sample = this.data[i];
        let absSample = Math.abs(sample);

        if (absSample > envelope) {
            envelope *= attack;
            envelope += (1 - attack) * absSample;
        } else {
            envelope *= release;
            envelope += (1 - release) * absSample;
        }

        if (envelope > threshold) {
            gain = threshold / envelope;
        } else {
            gain = 1;
        }

        compressedAudio[i] = sample * gain * ratio;
    }
    this.data = compressedAudio;
    // automatically set gain to match loudest value in original data
    this.full(initial_maximum_value);
    return this;
  }

  distavg () {
    let dist_sequence = [];
    let average = this.data.reduce((a, b) => a + b) / this.data.length;
    for (const [key, step] of Object.entries(this.data)) {
      dist_sequence[key] = Number((step - average));
    }
    this.data = dist_sequence;
    return this;
  }

  divide (sequence2, match_sizes = true) {
    if ( typeof sequence2 == 'number' || Array.isArray(sequence2) === true ) {
      sequence2 = new FacetPattern().from(sequence2);
    }
    let out = [];
    if (match_sizes != false) {
      let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
      for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
        out[key] = same_size_arrays[0].data[key] / same_size_arrays[1].data[key];
      }
    }
    else {
      if (this.data.length >= sequence2.data.length) {
        for (const [key, step] of Object.entries(this.data)) {
          if (isNaN(sequence2.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step / sequence2.data[key];
          }
        }
      }
      else {
        for (const [key, step] of Object.entries(sequence2.data)) {
          if (isNaN(this.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step / this.data[key];
          }
        }
      }
    }
    this.data = out;
    this.fixnan();
    return this;
  }

  dup (num) {
    if ( num <= 0 ) {
      return this;
    }
    this.data = Array.from({length: Number(num+1)}).flatMap(a => this.data)
    this.flatten();
    return this;
  }

  echo (num, feedback) {
    num = Math.round(Math.abs(Number(num)));
    feedback = Number(feedback);
    if ( !feedback ) {
      feedback = 0.666;
    }
    if ( num < 0 ) {
      num = Math.abs(num);
    }
    if ( num === 0 ) {
      return this;
    }
    let next_copy = new FacetPattern().from(this.data);
    for (var x = 0; x < num; x++) {
      next_copy.times(feedback)
      this.flatten().append(next_copy);
    }
    this.flatten();
    return this;
  }

  equals (sequence2, match_sizes = true) {
    if ( !this.isFacetPattern(sequence2) ) {
      throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
    }
    let out = [];
    if (match_sizes != false) {
      let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
      for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
        out[key] = (same_size_arrays[0].data[key] == same_size_arrays[1].data[key]);
      }
    }
    else {
      if (this.data.length >= sequence2.data.length) {
        for (const [key, step] of Object.entries(this.data)) {
          if (isNaN(sequence2.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step == sequence2.data[key];
          }
        }
      }
      else {
        for (const [key, step] of Object.entries(sequence2.data)) {
          if (isNaN(this.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step == this.data[key];
          }
        }
      }
    }
    this.data = out.map(bool => bool ? 1 : 0);
    return this;
  }



  flipabove (maximum) {
    maximum = Number(maximum);
    let flipped_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( step > maximum ) {
        let amount_above = Math.abs(Number(step) - Number(maximum));
        flipped_sequence[key] = maximum - amount_above;
      }
      else {
        flipped_sequence[key] = step;
      }
    }
    this.data = flipped_sequence;
    return this;
  }

  flipbelow (min) {
    min = Number(min);
    let flipped_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( step < min ) {
        let amount_below = Math.abs(Number(min) - Number(step));
        flipped_sequence[key] = min + amount_below;
      }
      else {
        flipped_sequence[key] = step;
      }
    }
    this.data = flipped_sequence;
    return this;
  }

  follow (attackTime = SAMPLE_RATE / 0.1, releaseTime = SAMPLE_RATE / 4) {
    let envelope = [];
    let attack = Math.exp(-1 / attackTime);
    let release = Math.exp(-1 / releaseTime);
    let currentEnvelope = 0;
    for (let i = 0; i < this.data.length; i++) {
        let input = Math.abs(this.data[i]);
        if (input > currentEnvelope) {
            currentEnvelope = attack * currentEnvelope + (1 - attack) * input;
        } else {
            currentEnvelope = release * currentEnvelope + (1 - release) * input;
        }
        envelope.push(currentEnvelope);
    }
    this.data = envelope;
    return this;
  }

  fracture (pieces) {
    pieces = Math.round(Math.abs(Number(pieces)));
    let fracture_sequence = [];
    let break_points = [];
    for (var i = 0; i < pieces; i++) {
      break_points.push(Math.floor(Math.random() * this.data.length));
    }
    break_points = new FacetPattern().from(break_points).sort();
    let chunks = [];
    let chunk = [];
    for (var i = 0; i < this.data.length; i++) {
      chunk.push(this.data[i]);
      for (var a = 0; a < break_points.data.length; a++) {
        if ( break_points.data[a] == i || i == (this.data.length - 1)) {
          chunks.push(chunk);
          chunk = [];
          break;
        }
      }
    }
    chunks = new FacetPattern().from(chunks).shuffle();
    for (var i = 0; i < chunks.data.length; i++) {
      chunk = chunks.data[i];
      for (var a = 0; a < chunk.length; a++) {
        fracture_sequence.push(chunk[a]);
      }
    }
    this.data = fracture_sequence;
    return this;
  }

  gt (amt) {
    let gt_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      gt_sequence[key] = (Number(step) > Number(amt)) ? 1 : 0;
    }
    this.data = gt_sequence;
    return this;
  }

  gte (amt) {
    let gte_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      gte_sequence[key] = (Number(step) >= Number(amt)) ? 1 : 0;
    }
    this.data = gte_sequence;
    return this;
  }

  interlace (sequence2) {
      if ( !this.isFacetPattern(sequence2) ) {
        throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
      }
      let interlaced_sequence = [];
      let interlace_every;
      let big_sequence = this, small_sequence = sequence2;
      if ( this.data.length > sequence2.data.length ) {
        interlace_every = parseInt(this.data.length / sequence2.data.length);
        big_sequence.reduce(sequence2.data.length);
      }
      else if ( sequence2.data.length > this.data.length ) {
        interlace_every = parseInt(sequence2.data.length / this.data.length);
        big_sequence = sequence2;
        big_sequence.reduce(this.data.length);
        small_sequence = this;
      }
      else if ( sequence2.data.length == this.data.length ) {
          interlace_every = 1;
      }
      for (const [key, step] of Object.entries(this.data)) {
        interlaced_sequence.push(big_sequence.data[key]);
        if ( Number(key) % interlace_every == 0 ) {
          if ( isNaN(small_sequence.data[key]) ) {
            interlaced_sequence.push(0)
          }
          else {
            interlaced_sequence.push(small_sequence.data[key]);
          }
        }
      }
      this.data = interlaced_sequence;
      return this;
  }

  interp (prob = 0.5, sequence2) {
    if ( !this.isFacetPattern(sequence2) ) {
      throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
    }
    let amt = Math.abs(Number(prob));
    let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
    this.data = same_size_arrays[0].data.map((value, index) => {
      return value + amt * (same_size_arrays[1].data[index] - value);
    });
   return this;
  }

  invert () {
    let inverted_sequence = [];
    let min = Infinity;
    let max = -Infinity;
    for (const step of this.data) {
        if (step < min) min = step;
        if (step > max) max = step;
    }
    for (const [key, step] of Object.entries(this.data)) {
        inverted_sequence[key] = min + (max - step);
    }
    this.data = inverted_sequence;
    return this;
  }

  jam (prob, amt) {
    amt = Number(amt);
    prob = Number(prob);
    let jammed_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( step != 0 ) {
        if ( Math.random() < prob) {
          // changed
          let step_distance = Math.random() * amt;
          // half the time make it smaller
          if ( Math.random() < 0.5 ) {
            step_distance *= -1;
          }
          jammed_sequence[key] = Number((Number(step) + Number(step_distance)));
        }
        else {
          // unchanged
          jammed_sequence[key] = step;
        }
      }
      else {
        // unchanged
        jammed_sequence[key] = step;
      }
    }
    this.data = jammed_sequence;
    return this;
  }

  log (base, rotation = 1) {
      this.warp(base, rotation);
      return this;
  }

  logslider(position) {
  var minp = 0;
  var maxp = 1;
  var minv = Math.log(0.1);
  var maxv = Math.log(1000);
  var scale = (maxv-minv) / (maxp-minp);
  return Math.exp(minv + scale*(position-minp));
}

  biquad(a,b,c,d,e) {
    // implemented based on: https://docs.cycling74.com/max7/tutorials/08_filterchapter02
    a = Number(a);
    b = Number(b);
    c = Number(c);
    d = Number(d);
    e = Number(e);
    let filter_out = [];
    for (var i = 0; i < this.data.length; i++) {
      let prev_step = i-1,prev2_step = i-2;
      if (i == 0) {
        prev_step = this.data.length-1;
        prev2_step = this.data.length-2;
      }
      else if (i == 1) {
        prev_step = 0;
        prev2_step = this.data.length-1;
      }

      if (filter_out.length >= 2) {
        filter_out.push(
            (this.data[i]*a)
          + (this.data[prev_step]*b)
          + (this.data[prev2_step]*c)
          - (filter_out[i-1]*d)
          - (filter_out[i-2]*e)
        );
      }
      else if (filter_out.length == 1) {
        filter_out.push(
            (this.data[i]*a)
          + (this.data[prev_step]*b)
          + (this.data[prev2_step]*c)
          - (filter_out[i-1]*d)
        );
      }
      else {
        filter_out.push(
            (this.data[i]*a)
          + (this.data[prev_step]*b)
          + (this.data[prev2_step]*c)
        );
      }
    }
    this.data = filter_out;
    return this;
  }

  allpass(frequency = SAMPLE_RATE / 2) {
    let outputArray = [];
    let a = (Math.tan(Math.PI * frequency / SAMPLE_RATE) - 1) / (Math.tan(Math.PI * frequency / SAMPLE_RATE) + 1);
    for (let i = 0; i < this.data.length; i++) {
        let x = this.data[i];
        let y;
        if (i === 0) {
            y = -a * x;
        } else {
            y = -a * x + this.data[i - 1] + a * outputArray[i - 1];
        }
        outputArray.push(y);
    }
    this.data = outputArray;
    return this;
  }

  trim () {
    let dbArr = this.data.map(x => 20 * Math.log10(Math.abs(x)));
    let end = dbArr.length - 1;
    while (dbArr[end] < -70) {
        end--;
    }
    this.data = this.data.slice(0, end + 1);
    return this;
  }

  resonate (baseFrequency, coefficients, q = 80, wet = 1) {
    let initial_maximum_value = this.getMaximumValue();
    baseFrequency = Math.abs(Number(baseFrequency));
    q = Math.abs(Number(q));
    wet = Math.abs(Number(wet));
    let tail_fp = new FacetPattern().from(this.data).reverb().times(new FacetPattern().from(this.data).times(0),false);
    this.sup(tail_fp,0);
    if (wet > 1 ) {
      wet = 1;
    }
    if ( !this.isFacetPattern(coefficients) ) {
      throw `input must be a FacetPattern object; type found: ${typeof coefficients}`;
    }
    let out_fp = new FacetPattern();
    for (var i = 0; i < coefficients.data.length; i++) {
      out_fp.sup(new FacetPattern().from(this.data).bpf(baseFrequency*coefficients.data[i],q),0);
    }
    let dry = Math.abs(1 - wet);
    this.times(dry);
    out_fp.times(wet);
    this.sup(out_fp,0);
    this.full(initial_maximum_value);
    this.fadeout(0.2);
    return this;
  }

  harmonics(num_harmonics) {
    if (typeof num_harmonics == 'number' || Array.isArray(num_harmonics) === true) {
        num_harmonics = new FacetPattern().from(num_harmonics);
    }
    num_harmonics.size(this.data.length);
    let initial_maximum_value = this.getMaximumValue();
    let result = [];
    for (let i = 0; i < this.data.length; i++) {
        let harmonicSum = 0;
        let num_harmonicsIndex = Math.floor((i / this.data.length) * num_harmonics.data.length);
        let numHarmonics = Math.abs(Math.floor(Number(num_harmonics.data[num_harmonicsIndex])));
        for (let j = 1; j <= numHarmonics; j++) {
            harmonicSum += Math.sin(j * this.data[i]) + Math.cos(j * this.data[i]);
        }
        result.push(this.data[i] + harmonicSum);
    }
    this.data = result;
    this.full(initial_maximum_value);
    this.audio();
    return this;
  }

  lpf (cutoffPattern, q = 2.5) {
    if ( typeof cutoffPattern == 'number' || Array.isArray(cutoffPattern) === true ) {
      cutoffPattern = new FacetPattern().from(cutoffPattern);
    }
    let initial_size = this.data.length;
    cutoffPattern.size(initial_size);
    let silencePattern = new FacetPattern().silence(SAMPLE_RATE);
    this.prepend(silencePattern);
    // scale up cutoffPattern to match the size of this.data
    cutoffPattern.prepend(silencePattern);
    // apply a low-pass filter to this.data
    // using the values in cutoffPattern as the cutoff values
    this.data = this.lpfInner(this.data, cutoffPattern.data,q);
    this.fixnan();
    this.reverse().truncate(initial_size).reverse();
    return this;
  }

  // runs per-sample LPF for lpmod
  lpfInner(data, cutoffs, q) {
    let filteredData = [];
    let prevValue1 = data[0];
    let prevValue2 = data[0];
    let a0, a1, a2, b1, b2;
    for (let i = 0; i < data.length; i++) {
        let w0 = 2 * Math.PI * cutoffs[i] / SAMPLE_RATE;
        let alpha = Math.sin(w0) / (2 * q);
        a0 = 1 + alpha;
        a1 = -2 * Math.cos(w0);
        a2 = 1 - alpha;
        b1 = (1 - Math.cos(w0)) / 2;
        b2 = 1 - Math.cos(w0);
        if (i < 2) {
            filteredData[i] = data[i];
        } else {
            filteredData[i] = (b1 * data[i] + b2 * prevValue1 + b1 * prevValue2 - a1 * filteredData[i-1] - a2 * filteredData[i-2]) / a0;
        }
        prevValue2 = prevValue1;
        prevValue1 = data[i];
    }
    return filteredData;
  }

  hpf(cutoffPattern, q = 2.5) {
    if (typeof cutoffPattern == 'number' || Array.isArray(cutoffPattern) === true) {
        cutoffPattern = new FacetPattern().from(cutoffPattern);
    }
    let initial_size = this.data.length;
    cutoffPattern.size(initial_size);
    let silencePattern = new FacetPattern().silence(SAMPLE_RATE);
    this.prepend(silencePattern);
    // scale up cutoffPattern to match the size of this.data
    cutoffPattern.prepend(silencePattern);
    // apply a high-pass filter to this.data
    // using the values in cutoffPattern as the cutoff values
    this.data = this.hpfInner(this.data, cutoffPattern.data, q);
    this.fixnan();
    this.reverse().truncate(initial_size).reverse();
    return this;
  }

  // runs per-sample HPF for hpmod
  hpfInner(data, cutoffs, q) {
    let filteredData = [];
    let prevValue1 = data[0];
    let prevValue2 = data[0];
    let a0, a1, a2, b1, b2;
    for (let i = 0; i < data.length; i++) {
      let w0 = 2 * Math.PI * cutoffs[i] / SAMPLE_RATE;
      let alpha = Math.sin(w0) / (2 * q);
      a0 = 1 + alpha;
      a1 = -2 * Math.cos(w0);
      a2 = 1 - alpha;
      b1 = (1 + Math.cos(w0)) / 2;
      b2 = -(1 + Math.cos(w0));
      if (i < 2) {
          filteredData[i] = data[i];
      } else {
          filteredData[i] = (b1 * data[i] + b2 * prevValue1 + b1 * prevValue2 - a1 * filteredData[i-1] - a2 * filteredData[i-2]) / a0;
      }
      prevValue2 = prevValue1;
      prevValue1 = data[i];
    }
    return filteredData;
  }

  bpf(cutoffPattern, q = 2.5) {
    if (typeof cutoffPattern == 'number' || Array.isArray(cutoffPattern) === true) {
        cutoffPattern = new FacetPattern().from(cutoffPattern);
    }
    let initial_size = this.data.length;
    cutoffPattern.size(initial_size);
    let silencePattern = new FacetPattern().silence(SAMPLE_RATE);
    this.prepend(silencePattern);
    // scale up cutoffPattern to match the size of this.data
    cutoffPattern.prepend(silencePattern);
    // apply a band-pass filter to this.data
    // using the values in cutoffPattern as the cutoff values
    this.data = this.bpfInner(this.data, cutoffPattern.data, q);
    this.fixnan();
    this.reverse().truncate(initial_size).reverse();
    return this;
  }

  // runs per-sample BPF for bpmod
  bpfInner(data, cutoffs, q) {
    let filteredData = [];
    let prevValue1 = data[0];
    let prevValue2 = data[0];
    let a0, a1, a2, b1;
    for (let i = 0; i < data.length; i++) {
        let w0 = 2 * Math.PI * cutoffs[i] / SAMPLE_RATE;
        let alpha = Math.sin(w0) / (2 * q);
        a0 = 1 + alpha;
        a1 = -2 * Math.cos(w0);
        a2 = 1 - alpha;
        b1 = alpha;
        if (i < 2) {
            filteredData[i] = data[i];
        } else {
            filteredData[i] = (b1 * data[i] - b1 * prevValue2 - a1 * filteredData[i-1] - a2 * filteredData[i-2]) / a0;
        }
        prevValue2 = prevValue1;
        prevValue1 = data[i];
    }
    return filteredData;
  }

  lt (amt) {
    let lt_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      lt_sequence[key] = (Number(step) < Number(amt)) ? 1 : 0;
    }
    this.data = lt_sequence;
    return this;
  }

  lte (amt) {
    let lte_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      lte_sequence[key] = (Number(step) <= Number(amt)) ? 1 : 0;
    }
    this.data = lte_sequence;
    return this;
  }
f
  map (fp) {
    if ( !this.isFacetPattern(fp) && !Array.isArray(fp) ) {
      throw `input must be a FacetPattern or array; type found: ${typeof fp}`;
    }
    if ( Array.isArray(fp) === true ) {
      fp = new FacetPattern().from(fp);
    }
    // scale the data so it's in the range of the new_values
    this.scale(Math.min.apply(Math, fp.data),Math.max.apply(Math, fp.data));
    // safeguard against mapping more than 1 second's worth samples to another pattern.
    this.reduce(SAMPLE_RATE);
    let same_size_arrays = this.makePatternsTheSameSize(this, fp);
    let sequence = same_size_arrays[0];
    let new_values = same_size_arrays[1];
    let mapped_sequence = [];
    for (const [key, step] of Object.entries(sequence.data)) {
      mapped_sequence[key] = new_values.data.reduce((a, b) => {
        return Math.abs(b - step) < Math.abs(a - step) ? b : a;
      });
    }
    this.data = mapped_sequence;
    return this;
  }

  mtof() {
    let mtof_sequence = [];
    for (let [key, step] of Object.entries(this.data)) {
      step = Math.abs(Number(step));
      mtof_sequence[key] = Math.pow(2,(step-69)/12) * 440;
    }
    this.data = mtof_sequence;
    return this;
  }

  mtos () {
    let samples = [];
    for (let i = 0; i < this.data.length; i++) {
      let midiNote = this.data[i];
      let frequency = Math.pow(2, (midiNote - 69) / 12) * 440;
      let numSamples = Math.round(SAMPLE_RATE / frequency);
      samples.push(numSamples);
    }
    this.data = samples;
    return this;
  }

  ftom() {
    let ftom_sequence = [];
    for (let [key, step] of Object.entries(this.data)) {
      step = Math.abs(Number(step));
      ftom_sequence[key] = Math.round(12 * Math.log2(step / 440) + 69);
    }
    this.data = ftom_sequence;
    return this;
  }

  modulo (amt) {
    let modulo_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      modulo_sequence[key] = Number(step) % Number(amt);
    }
    this.data = modulo_sequence;
    return this;
  }

  nonzero () {
    let lastNonZero = this.data[this.data.length - 1];
    let changed = false;
    for (let i = 0; i < this.data.length; i++) {
        if (this.data[i] === 0) {
          this.data[i] = lastNonZero;
            changed = true;
        } else {
            lastNonZero = this.data[i];
        }
    }
    if (changed && lastNonZero !== 0) {
        this.nonzero(this.data);
    }
    return this;
  }

  or ( sequence2, match_sizes = true ) {
    if ( !this.isFacetPattern(sequence2) ) {
      throw `input must be a FacetPattern object; type found: ${typeof sequence2}`;
    }
    let out = [];
    if (match_sizes != false) {
      let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
      for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
        out[key] = (same_size_arrays[0].data[key] != 0 || same_size_arrays[1].data[key] != 0);
      }
    }
    else {
      if (this.data.length >= sequence2.data.length) {
        for (const [key, step] of Object.entries(this.data)) {
          if (isNaN(sequence2.data[key])) {
            out[key] = (step != 0);
          }
          else {
            out[key] = (step != 0) || (sequence2.data[key] != 0);
          }
        }
      }
      else {
        for (const [key, step] of Object.entries(sequence2.data)) {
          if (isNaN(this.data[key])) {
            out[key] = (step != 0);
          }
          else {
            out[key] = (step != 0) || (this.data[key] != 0);
          }
        }
      }
    }
    this.data = out.map(bool => bool ? 1 : 0);
    return this;
  }

  palindrome () {
    this.data = this.data.concat(this.reverse().data);
    return this;
  }

  wrap (min, max) {
    min = Number(min);
    if (!max) {
      max = min;
      min *= -1;
    }
    max = Number(max);
    let range = [min, max];
    let sorted_range = range.sort(function(a,b) { return a - b;});
    min = sorted_range[0];
    max = sorted_range[1];
    if ( min == max ) {
      throw `Cannot run wrap with equal min and max: ${min}`;
    }
    let pong_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      let new_step = step;
      let step_is_outside_range = ((step < min) || (step > max));
      while (step_is_outside_range) {
        if ( new_step < min )  {
          new_step = max - Math.abs(new_step - min);
        }
        else if ( new_step > max ) {
          new_step = min + Math.abs(new_step - max);
        }
        step_is_outside_range = ((new_step < min) || (new_step > max));
      }
      pong_sequence[key] = new_step;
    }
    this.data = pong_sequence;
    return this;
  }

  pow (base, rotation = 1) {
      this.warp(base, rotation).invert().reverse();
      return this;
  }

  prob (amt) {
    amt = Number(amt);
    if ( amt < 0 ) {
      amt = 0;
    }
    else if ( amt > 1 ) {
      amt = 1;
    }
    let prob_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( Math.random() < amt ) {
        prob_sequence[key] = step;
      }
      else {
        prob_sequence[key] = 0;
      }
    }
    this.data = prob_sequence;
    return this;
  }

  quantize (resolution) {
    resolution = parseInt(Number(resolution));
    let quantized_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( key % resolution == 0 ) {
        // only pass nonzero steps if the modulo of their key is 0
        quantized_sequence[key] = step;
      }
      else {
        quantized_sequence[key] = 0;
      }
    }
    this.data = quantized_sequence;
    return this;
  }

  range (new_min, new_max) {
    // this is a horizontal range - returns a range of the buffer
    let min = parseInt(Number(new_min) * this.data.length);
    let max = parseInt(Number(new_max) * this.data.length);
    if (max < min) {
      max = parseInt(Number(new_min) * this.data.length);;
      min = parseInt(Number(new_max) * this.data.length);;
    }
    this.data = this.data.slice(min,max);
    return this;
  }

  rangesamps(start, length) {
    let startIndex = Math.floor(start * this.data.length);
    let endIndex = startIndex + length;
    this.data = this.data.slice(startIndex, endIndex);
    return this;
  }

  reduce (new_size) {
    let orig_size = this.data.length;
    new_size = Number(new_size);
    if ( new_size > orig_size ) {
      return this;
    }
    let reduced_sequence = [];
    for ( let i = 0; i < new_size; i++ ) {
      let large_array_index = Math.floor(i * (orig_size + Math.floor(orig_size / new_size)) / new_size);
      reduced_sequence[i] = this.data[large_array_index];
    }
    this.data = reduced_sequence;
    return this;
  }

  replace ( original_value, new_value ) {
    original_value = Number(original_value);
    new_value = Number(new_value);
    let replaced_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if (step === original_value) {
        replaced_sequence[key] = new_value;
      }
      else {
        replaced_sequence[key] = step;
      }
    }
    this.data = replaced_sequence;
    return this;
  }

  reverb (size = 1, feedback = 0.85) {
    if ( feedback >= 0.999 ) {
      feedback = 0.999;
    }
    else if ( feedback < 0 ) {
      feedback = 0;
    }
    if (size <= 0 ) {
      size = 0.01;
    }
    let initial_maximum_value = this.getMaximumValue();
    let tap_in = new FacetPattern().from(this.data).audio().allpass(347).allpass(113).allpass(37);
    let out_fp = new FacetPattern();
    let tap1_fp = new FacetPattern().from(tap_in.data).delay(1687*size,feedback);
    let tap2_fp = new FacetPattern().from(tap_in.data).delay(1601*size,feedback);
    let tap3_fp = new FacetPattern().from(tap_in.data).delay(2053*size,feedback);
    let tap4_fp = new FacetPattern().from(tap_in.data).delay(2251*size,feedback);
    out_fp.sup(tap1_fp,0).sup(tap2_fp,0).sup(tap3_fp,0).sup(tap4_fp,0);
    this.data = out_fp.data;
    this.full(initial_maximum_value);
    return this;
  }

  pitch ( pitchShiftFactors ) {
    if (typeof pitchShiftFactors == 'number' || Array.isArray(pitchShiftFactors) === true) {
        pitchShiftFactors = new FacetPattern().from(pitchShiftFactors);
    }
    pitchShiftFactors.size(this.data.length).clip(1/32, 32);
    let windowSize = 1024;
    let hopSize = windowSize / 4;
    let outputArray = [];
    let window = this.hannWindow(windowSize);
    for (let i = 0; i < this.data.length; i += hopSize) {
        let segment = this.data.slice(i, i + windowSize);
        if (segment.length < windowSize) {
            let padding = new Array(windowSize - segment.length).fill(0);
            segment = segment.concat(padding);
        }
        for (let j = 0; j < segment.length; j++) {
            segment[j] *= window[j];
        }
        let pitchShiftFactorIndex = Math.floor((i / this.data.length) * pitchShiftFactors.data.length);
        let pitchShiftFactor = Math.abs(Number(pitchShiftFactors.data[pitchShiftFactorIndex]));
        if (pitchShiftFactor == 0) {
            pitchShiftFactor = 0.125;
        }
        let resampledSegment = this.resample(segment, 1 / pitchShiftFactor);
        if (resampledSegment.length > segment.length) {
            resampledSegment = resampledSegment.slice(0, segment.length);
        } else if (resampledSegment.length < segment.length) {
            let padding = new Array(segment.length - resampledSegment.length).fill(0);
            resampledSegment = resampledSegment.concat(padding);
        }
        for (let j = 0; j < resampledSegment.length; j++) {
            let outputIndex = i + j;
            if (outputIndex < outputArray.length) {
                outputArray[outputIndex] += resampledSegment[j];
            } else {
                outputArray.push(resampledSegment[j]);
            }
        }
    }
    this.data = outputArray;
    return this;
}

  hannWindow (size) {
      let window = [];
      for (let i = 0; i < size; i++) {
          window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
      }
      return window;
  }

  resample (array, factor) {
      let outputArray = [];
      for (let i = 0; i < array.length * factor; i++) {
          let index = i / factor;
          let indexFloor = Math.floor(index);
          let indexCeil = Math.ceil(index);
          if (indexCeil >= array.length) {
              indexCeil = array.length - 1;
          }
          let value = array[indexFloor] + (index - indexFloor) * (array[indexCeil] - array[indexFloor]);
          outputArray.push(value);
      }
      return outputArray;
  }

  crab () {
    let initial_maximum_value = this.getMaximumValue();
    let copy = new FacetPattern().from(this.data);
    this.silence(this.data.length);
    this.sup(copy,0);
    this.sup(copy.reverse(),0);
    this.full(initial_maximum_value);
    return this;
  }

  reverse () {
    let reversed_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      reversed_sequence[((this.data.length - 1) - key)] = step;
    }
    this.data = reversed_sequence;
    return this;
  }

  round () {
    let rounded_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      rounded_sequence[key] = Math.round(step);
    }
    this.data = rounded_sequence;
    return this;
  }

  saheach (num) {
    num = Math.round(Math.abs(Number(num)));
    let count = 0;
    let sah_sequence = [];
    let prev_step;
    for (const [key, step] of Object.entries(this.data)) {
      if ( count % num == 0 || key == 0 ) {
        sah_sequence[key] = step;
        prev_step = step;
      }
      else {
        sah_sequence[key] = prev_step;
      }
      count++;
    }
    this.data = sah_sequence;
    return this;
  }

  tanh(gains = 20) {
    if (typeof gains == 'number' || Array.isArray(gains) === true) {
        gains = new FacetPattern().from(gains);
    }
    gains.size(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
        let gainIndex = Math.floor((i / this.data.length) * gains.data.length);
        let gain = Number(gains.data[gainIndex]);
        this.data[i] = Math.tanh(this.data[i] * gain);
    }
    return this;
  }

  expo (expo_curve) {
    this.scale(this.minimum(),this.maximum(),expo_curve);
    return this;
  }

  scale (outMin, outMax, exponent = 1) {
    if ( this.data.length == 1 ) {
      this.data = (outMin + outMax) / 2;
      return this;
    }
    if (exponent > 1 ) {
      let inMin = this.minimum();
      let inMax = this.maximum();
      let output = [];
      for (let i = 0; i < this.data.length; i++) {
          let normalized = (this.data[i] - inMin) / (inMax - inMin);
          let transformed;
          if (exponent >= 0 && exponent <= 1) {
              transformed = 1 - Math.pow(1 - normalized, exponent);
          } else {
              transformed = Math.pow(normalized, exponent);
          }
          let scaled = transformed * (outMax - outMin) + outMin;
          output.push(scaled);
      }
      this.data = output;
    }
    else {
      this.scaleLT1(outMin,outMax,exponent);
    }
    return this;
}

scaleLT1 (outMin, outMax, exponent = 1) {
  if ( this.data.length == 1 ) {
    return (outMin + outMax) / 2;
  }
  let inMin = this.minimum();
  let inMax = this.maximum();
  let output = [];
  for (let i = 0; i < this.data.length; i++) {
      let normalized = (this.data[i] - inMin) / (inMax - inMin);
      let transformed;
      if (exponent >= 0 && exponent <= 1) {
          transformed = Math.pow(normalized, exponent);
      } else {
          transformed = inMax - Math.pow(inMax - normalized, exponent);
      }
      let scaled = transformed * (outMax - outMin) + outMin;
      output.push(scaled);
  }
  this.data = output;
  return this;
}

  shift (amt) {
    let moved_sequence = [];
    amt = Number(amt);
    // wrap the phase shift amount between -1 and 1
    if (amt < -1 || amt > 1 ) {
      let new_amt = amt;
      let amt_is_outside_range = ((amt < -1) || (amt > 1));
      while (amt_is_outside_range) {
        if ( new_amt < -1 )  {
          new_amt = 1 - Math.abs(new_amt - -1);
        }
        else if ( new_amt > 1 ) {
          new_amt = -1 + Math.abs(new_amt - 1);
        }
        amt_is_outside_range = ((new_amt < -1) || (new_amt > 1));
      }
      amt = new_amt;
    }

    // moving left require the keys to become bigger, but the argument makes more sense
    // when moving left is negative, hence the * - 1 here.
    let direction = -1 * (amt * this.data.length);
    for (const [key, step] of Object.entries(this.data)) {
      let new_key = Math.round(Number(key) + Number(direction));
      if ( new_key < 0 ) {
        // wrap to end
        new_key = this.data.length - (Math.abs(new_key));
      }
      else if ( new_key >= this.data.length ) {
        // wrap to beginning
        new_key = Math.abs((this.data.length + 1) - new_key);
      }
      moved_sequence[key] = this.data[new_key];
    }
    this.data = moved_sequence;
    return this;
  }

  shuffle (probability = 1) {
    if (this.data.length < 1) {
      return this;
    }
  
    let shuffle_sequence = this.data;
    let numToShuffle = Math.round(probability * shuffle_sequence.length);
  
    for (let i = shuffle_sequence.length - 1; i >= shuffle_sequence.length - numToShuffle; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffle_sequence[i], shuffle_sequence[j]] = [shuffle_sequence[j], shuffle_sequence[i]];
    }
    this.data = shuffle_sequence;
    return this;
  }

  sieve (modulatorData) {
    // scale modulator data to be the same length as input data. whichever is larger is what the other is scaled to
    if (modulatorData.data.length > this.data.length ) {
      this.stretchto(modulatorData.data.length);
    }
    else {
      modulatorData.size(this.data.length);
    }
    // clip modulator data to be within 0 and 1
    let clippedModulatorData = modulatorData.data.map(x => Math.max(0, Math.min(1, x)));
    // Use modulator data as a lookup table
    let output = new Array(this.data.length);
    for (let i = 0; i < this.data.length; i++) {
        output[i] = this.data[Math.round(clippedModulatorData[i] * (this.data.length - 1))];
    }
    this.data = output;
    this.flatten();
    return this;
  }

  slew (depth = 25, up_speed = 1, down_speed = 1) {
    let slewed_sequence = [];
    up_speed = Math.abs(up_speed);
    down_speed = Math.abs(down_speed);
    depth = Math.round(Math.abs(Number(depth)));
    if ( up_speed < 0.02 ) {
      up_speed = 0.02;
    }
    else if ( up_speed > 1 ) {
      up_speed =  1;
    }
    if ( down_speed < 0.02 ) {
      down_speed = 0.02;
    }
    else if ( down_speed > 1 ) {
      down_speed =  1;
    }
    for (const [key, step] of Object.entries(this.data)) {
      let k = Number(key);
        // check if next step up or down
        // if up, run from this step to next step in (up_speed * depth) samples, then hold for rest of depth
        // if down, run from this step to next step in (down_speed * depth) samples, then hold for rest of depth
      if ( !isNaN(this.data[k+1]) ) {
        if ( this.data[k+1] > this.data[k] ) {
          // up
          for (var i = 0; i < depth; i++) {
            if ( i < Math.round(up_speed * depth) ) {
              // up slew
              slewed_sequence.push(((Number(this.data[k]) * (1-(i/Math.round(up_speed * depth)))) + (Number(this.data[k+1]) * (i/Math.round(up_speed * depth)))));
            }
            else {
              // hold
              slewed_sequence.push(this.data[k+1]);
            }
          }
        }
        else if ( this.data[k+1] < this.data[k] ) {
          // down
          for (var i = 0; i < depth; i++) {
            if ( i < Math.round(down_speed * depth) ) {
              // down slew
              slewed_sequence.push(((Number(this.data[k]) * (1-(i/Math.round(up_speed * depth)))) + (Number(this.data[k+1]) * (i/Math.round(up_speed * depth)))));
            }
            else {
              // hold
              slewed_sequence.push(this.data[k+1]);
            }
          }
        }
        else {
          // static
          for (var i = 0; i < depth; i++) {
            slewed_sequence.push(this.data[k]);
          }
        }
      }
      else {
        // going back to first val
        if ( this.data[0] > this.data[k] ) {
          // up
          for (var i = 0; i < depth; i++) {
            if ( i < Math.round(up_speed * depth) ) {
              // up slew
              slewed_sequence.push(((Number(this.data[k]) * (1-(i/Math.round(up_speed * depth)))) + (Number(this.data[0]) * (i/Math.round(up_speed * depth)))));
            }
            else {
              // hold
              slewed_sequence.push(this.data[0]);
            }
          }
        }
        else if ( this.data[0] < this.data[k] ) {
          // down
          for (var i = 0; i < depth; i++) {
            if ( i < Math.round(down_speed * depth) ) {
              // down slew
              slewed_sequence.push(((Number(this.data[k]) * (1-(i/Math.round(up_speed * depth)))) + (Number(this.data[0]) * (i/Math.round(up_speed * depth)))));
            }
            else {
              // hold
              slewed_sequence.push(this.data[0]);
            }
          }
        }
        else {
          // static
          for (var i = 0; i < depth; i++) {
            slewed_sequence.push(this.data[0]);
          }
        }
      }
    }
    this.data = slewed_sequence;
    return this;
  }

  smooth () {
    let smoothed_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      let k = Number(key);
      if ( k > 0 && ( (k + 1) < this.data.length ) ) {
        // all other steps
        smoothed_sequence[k] = parseFloat(smoothed_sequence[k-1] + this.data[k]) / 2;
      }
      else if ( k +1 ==  this.data.length ) {
        // last step loops around to average with first
        smoothed_sequence[k] = parseFloat(smoothed_sequence[k-1] + this.data[0]) / 2;
      }
      else {
        // first step is static
        smoothed_sequence[k] = step;
      }
    }
    this.data = smoothed_sequence;
    return this;
  }

  speed (ratio) {
    ratio = Math.abs(Number(ratio));
    let upscaled_data = [];
    let new_samps = Math.floor(this.data.length / ratio);
    let copies_of_each_value = Math.floor(new_samps/this.data.length) + 1;
    for (var n = 0; n < this.data.length; n++) {
      let i = 0;
      while (i < copies_of_each_value) {
        upscaled_data.push(this.data[n]);
        i++;
      }
    }
    this.data = upscaled_data;
    this.reduce(new_samps);
    return this;
  } 

  flange (delaySamples = 220, depth = 110) {
    const output = [];
    for (let i = 0; i < this.data.length; i++) {
      const delay = Math.sin(i / this.data.length * Math.PI * 2) * depth + delaySamples;
      const delayIndex = i - Math.floor(delay);
      if (delayIndex < 0) {
        output[i] = this.data[i];
      } else {
        output[i] = (this.data[i] + this.data[delayIndex]) / 2;
      }
    }
    this.data = output;
    return this;
  }

  size (new_size) {
    new_size = Math.round(Math.abs(Number(new_size)));
    // get ratio between current size and new size
    let change_ratio = this.data.length / new_size;
    this.speed(change_ratio);
    return this;
  }

  stretch ( stretchFactors, chunksPerSecond = new FacetPattern().from(128) ) {
    if (typeof stretchFactors == 'number' || Array.isArray(stretchFactors) === true) {
        stretchFactors = new FacetPattern().from(stretchFactors);
    }
    if (typeof chunksPerSecond == 'number' || Array.isArray(chunksPerSecond) === true) {
        chunksPerSecond = new FacetPattern().from(chunksPerSecond);
    }
    stretchFactors.size(this.data.length).clip(0.001,16);
    chunksPerSecond.clip(1, Math.round(SAMPLE_RATE / (SAMPLE_RATE * .002)-2)).size(this.data.length);
    let outputArray = [];
    let skip_every = 0;
    for (let i = 0; i < this.data.length; i += Math.round(SAMPLE_RATE / chunksPerSecond.data[i])) {
        let chunkSize = Math.round(SAMPLE_RATE / chunksPerSecond.data[i]);
        let chunk = this.data.slice(i, i + chunkSize);
        let stretchFactorIndex = Math.floor((i / this.data.length) * stretchFactors.data.length);
        let stretchFactor = Number(stretchFactors.data[stretchFactorIndex]);
        if (stretchFactor >= 1) {
            for (let j = 0; j < stretchFactor; j++) {
                outputArray.push(chunk);
            }
        } else {
            let skipFactor = Math.round(1 / stretchFactor);
            if (skip_every % skipFactor === 0) {
                outputArray.push(chunk);
            }
        }
        skip_every++;
    }
    this.data = outputArray;
    this.data = this.fadeArrays(this.data);
    this.data = this.sliceEndFade(this.data);
    this.flatten();
    return this;
}

  stretchto ( samps, chunksPerSecond = new FacetPattern().from(128) ) {
    let stretchFactor = samps / this.data.length;
    this.stretch(stretchFactor, chunksPerSecond);
    this.resizeInner(samps);
    return this;
  }

  resizeInner (newSize) {
    let newData = [];
    let origSize = this.data.length;
    let scale = (origSize - 1) / (newSize - 1);
    for (let i = 0; i < newSize; i++) {
        let j = i * scale;
        let index = Math.floor(j);
        let fraction = j - index;
        if (index + 1 < origSize) {
            newData[i] = this.data[index] * (1 - fraction) + this.data[index + 1] * fraction;
        } else {
            newData[i] = this.data[index];
        }
    }
    this.data = newData;
    return this;
  }

  full (new_maximum = 1) {
    let maxVal = 0;
    for (let i = 0; i < this.data.length; i++) {
      maxVal = Math.max(maxVal, Math.abs(this.data[i]));
    }
    let gain = new_maximum / maxVal;
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] *= gain;
    }
    return this;
   }

  sort () {
    let sorted_sequence = [];
    sorted_sequence = this.data.sort(function(a, b) { return a - b; });
    this.data = sorted_sequence;
    return this;
  }

  sticky (amt) {
    amt = Number(amt);
    if ( amt < 0 ) {
      amt = 0;
    }
    else if ( amt > 1 ) {
      amt = 1;
    }
    amt = Math.pow(amt, 10);
    let sticky_sequence = [];
    let stuck_key;
    for (const [key, step] of Object.entries(this.data)) {
      if ( Math.random() > amt ) {
        stuck_key = key;
        sticky_sequence[key] = step;
      }
      else {
        if ( this.data[stuck_key] ) {
          sticky_sequence[key] = this.data[stuck_key];
        }
        else {
          sticky_sequence[key] = step;
        }
      }
    }
    this.data = sticky_sequence;
    return this;
  }

  stutter (repeats, start_pos = 0, end_pos = 1) {
    repeats = Math.abs(Math.round(Number(repeats)));
    if ( repeats < 1 ) {
      return this;
    }
    start_pos = Math.abs(Number(start_pos));
    if ( start_pos > 1 ) {
      throw `stutter start_pos value must be between 0 and 1, value found: ${start_pos}`;
    }
    end_pos = Math.abs(Number(end_pos));
    if ( end_pos > 1 ) {
      throw `stutter end_pos value must be between 0 and 1, value found: ${end_pos}`;
    }
    let original_length = this.data.length;
    let stutter_fp = new FacetPattern().from(this.range(start_pos,end_pos).data).speed(repeats).dup(repeats-1).size(original_length);
    this.data = stutter_fp.data;
    return this;
  }

  subset (percentage) {
    percentage = Number(percentage);
    if ( percentage < 0 ) {
      percentage = 0;
    }
    else if ( percentage > 1 ) {
      percentage = 1;
    }
    let subset_sequence = [];
    for (const [key, step] of Object.entries(this.data)) {
      if ( Math.random() < percentage ) {
        subset_sequence.push(step);
      }
    }
    this.data = subset_sequence;
    return this;
  }

  subtract (sequence2, match_sizes = true) {
    if ( typeof sequence2 == 'number' || Array.isArray(sequence2) === true ) {
      sequence2 = new FacetPattern().from(sequence2);
    }
    let out = [];
    if (match_sizes != false) {
      let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
      for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
        out[key] = (same_size_arrays[0].data[key] - same_size_arrays[1].data[key]);
      }
    }
    else {
      if (this.data.length >= sequence2.data.length) {
        for (const [key, step] of Object.entries(this.data)) {
          if (isNaN(sequence2.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step - sequence2.data[key];
          }
        }
      }
      else {
        for (const [key, step] of Object.entries(sequence2.data)) {
          if (isNaN(this.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step - this.data[key];
          }
        }
      }
    }
    this.data = out;
    this.fixnan();
    return this;
  }

  times (sequence2, match_sizes = true) {
    if ( typeof sequence2 == 'number' || Array.isArray(sequence2) === true ) {
      sequence2 = new FacetPattern().from(sequence2);
    }
    let out = [];
    if (match_sizes != false) {
      let same_size_arrays = this.makePatternsTheSameSize(this, sequence2);
      for (const [key, step] of Object.entries(same_size_arrays[0].data)) {
        out[key] = (same_size_arrays[0].data[key] * same_size_arrays[1].data[key]);
      }
    }
    else {
      if (this.data.length >= sequence2.data.length) {
        for (const [key, step] of Object.entries(this.data)) {
          if (isNaN(sequence2.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step * sequence2.data[key];
          }
        }
      }
      else {
        for (const [key, step] of Object.entries(sequence2.data)) {
          if (isNaN(this.data[key])) {
            out[key] = 0;
          }
          else {
            out[key] = step * this.data[key];
          }
        }
      }
    }
    this.data = out;
    this.fixnan();
    return this;
  }

  unique () {
    this.data = Array.from(new Set(this.data));
    return this;
  }

  walk (prob, amt) {
    // swap some of the locations
    let jammed_sequence = [];
    let x_max = this.data.length - 1;
    amt = Number(amt);
    prob = Number(prob);
    if ( prob < 0 ) {
      prob = 0;
    }
    else if ( prob > 1 ) {
      prob = 1;
    }
    for (const [key, step] of Object.entries(this.data)) {
      if ( Math.random() < prob) {
        // changed
        let step_distance = parseInt((Math.random() * amt));
        if ( step_distance < 1 ) {
          step_distance = 1;
        }
        // half the time make it smaller
        if ( Math.random() < 0.5 ) {
          step_distance = step_distance * -1;
        }
        let new_step_location = parseInt(key) + parseInt(step_distance);
        if (new_step_location < 0) {
          new_step_location = x_max - (0 - new_step_location) % (x_max - 0);
        }
        else {
          new_step_location = 0 + (new_step_location - 0) % (x_max - 0);
        }
        jammed_sequence[key] = this.data[new_step_location];
        jammed_sequence[new_step_location] = step;
      }
      else {
        // unchanged
        jammed_sequence[key] = step;
      }
    }
    this.data = jammed_sequence;
    return this;
  }

  warp (base, rotation = 1) {
    // forked from: https://github.com/naomiaro/fade-curves/blob/master/index.js
    let warp_sequence = [];
    let length = this.data.length;
    base = Math.abs(Number(base));
    base = this.logslider(base);
    rotation = Number(rotation);
    let curve = new Float32Array(length), index, x = 0, i;
    // create a curve that will be used to look up the original pattern's keys nonlinearly
    for ( i = 0; i < length; i++ ) {
      index = rotation > 0 ? i : length - 1 - i;
      x = i / length;
      curve[index] = Math.log(1 + base * x) / Math.log(1 + base);
    }
    // loop through the curve, pushing the corresponding pattern keys into the warped structure
    for (var a = 0; a < length; a++) {
      let foo = Math.round(Number(curve[a]) * length);
      if (foo >= this.data.length ) {
          foo = this.data.length - 1;
      }
      warp_sequence[a] = this.data[foo];
    }
    this.data = warp_sequence;
    return this;
  }

  // END modulator operations

  // WINDOW operations
  fade (fade_percent = 0.1) {
    this.fadein(fade_percent).fadeout(fade_percent);
    return this;
  }

  fadein(fade_amount) {
    let fade_length = Math.floor(this.data.length * fade_amount);
    for (let i = 0; i < fade_length; i++) {
        this.data[i] = this.data[i] * Math.sin((i / fade_length) * (Math.PI / 2));
    }
    for (let i = 0; i < fade_length; i++) {
      this.data[i] = this.data[i] * Math.sin((i / fade_length) * (Math.PI / 2));
    }
    return this;
  }

  fadeinSamples(fade_samples) {
    let fade_length = fade_samples;
    for (let j = 0; j < 20; j++) {
        for (let i = 0; i < fade_length; i++) {
            this.data[i] = this.data[i] * Math.sin((i / fade_length) * (Math.PI / 2));
        }
    }
    return this;
  }

  fadeout(fade_amount) {
    let fade_length = Math.floor(this.data.length * fade_amount);
    for (let i = this.data.length - 1; i >= this.data.length - fade_length; i--) {
        this.data[i] = this.data[i] * Math.sin(((this.data.length - i) / fade_length) * (Math.PI / 2));
    }
    for (let i = this.data.length - 1; i >= this.data.length - fade_length; i--) {
      this.data[i] = this.data[i] * Math.sin(((this.data.length - i) / fade_length) * (Math.PI / 2));
  }
    return this;
  }

  fadeoutSamples(fade_samples) {
    let fade_length = fade_samples;
    for (let j = 0; j < 20; j++) {
        for (let i = this.data.length - 1; i >= this.data.length - fade_length; i--) {
            this.data[i] = this.data[i] * Math.sin(((this.data.length - i) / fade_length) * (Math.PI / 2));
        }
    }
    return this;
  }
  // END WINDOW operations. shimmed from https://github.com/scijs/window-function

  // BEGIN audio operations
  audio () {
    this.hpf(5,1);
    return this;
  }

  channels (chans) {
    this.dacs = '';
    if ( typeof chans == 'number' ) {
      chans = [chans];
    }
    else if ( this.isFacetPattern(chans) ) {
      chans = chans.data;
    }
    for (var i = 0; i < Math.max(...chans); i++) {
      if ( chans.includes(i+1) ) {
        this.dacs += '1 ';
      }
      else {
        this.dacs += '0 ';
      }
    }
    // remove last space
    this.dacs = this.dacs.slice(0, -1);
    return this;
  }

  // semantically useful if you forget when running with one channel
  channel (chans) {
    this.channels(chans);
    return this;
  }

  ichunk (lookupPattern) {
    if ( typeof lookupPattern == 'number' || Array.isArray(lookupPattern) === true ) {
      lookupPattern = new FacetPattern().from(lookupPattern);
    }
    let outputArray = [];
    let chunkSize = Math.round(this.data.length / lookupPattern.data.length);
    for (let i = 0; i < lookupPattern.data.length; i++) {
        let chunkIndex = Math.floor(lookupPattern.data[i] * (lookupPattern.data.length-1));
        let chunkStart = chunkIndex * chunkSize;
        let chunkEnd = chunkStart + chunkSize;
        let chunk = this.data.slice(chunkStart, chunkEnd);
        outputArray.push(chunk);
    }
    this.data = outputArray;
    this.data = this.fadeArrays(this.data);
    this.data = this.sliceEndFade(this.data);
    this.flatten();
    return this;
  }

  mutechunks (numChunks = 16, probability = 0.75) {
    // Break the array into numChunks chunks
    let chunkSize = Math.ceil(this.data.length / numChunks);
    let chunks = [];
    for (let i = 0; i < this.data.length; i += chunkSize) {
        chunks.push(this.data.slice(i, i + chunkSize));
    }
    // Set some of the chunks to 0 based on the probability coefficient
    for (let chunk of chunks) {
        if (Math.random() < probability) {
            for (let i = 0; i < chunk.length; i++) {
                chunk[i] = 0;
            }
        }
    }
    // Stitch the 1D array back together
    let result = [];
    for (let chunk of chunks) {
        result.push(chunk);
    }
    this.data = result;
    this.data = this.fadeArrays(this.data);
    this.data = this.sliceEndFade(this.data);
    this.flatten();
    return this;
}

rechunk (numChunks, probability = 1) {
  // Break the array into numChunks chunks
  let chunkSize = Math.ceil(this.data.length / numChunks);
  let chunks = [];
  
  for (let i = 0; i < this.data.length; i += chunkSize) {
      chunks.push(this.data.slice(i, i + chunkSize));
  }

  // Determine number of chunks to shuffle based on probability
  let numChunksToShuffle = Math.floor(numChunks * probability);

  // Shuffle the numChunksToShuffle chunks
  for (let i = 0; i < numChunksToShuffle; i++) {
      let j = i + Math.floor(Math.random() * (chunks.length - i));

      // Swap chunks[i] and chunks[j]
      [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
  }

  // Assign the chunks array to the data
  this.data = chunks;
  this.data = this.fadeArrays(this.data);
  this.data = this.sliceEndFade(this.data);
  this.flatten();
  this.fixnan();
  return this;
}
  // END audio operations

  // BEGIN special operations

nextPowerOf2(n) {
  let count = 0;

  if (n && !(n & (n - 1)))
      return n;

  while( n != 0) {
      n >>= 1;
      count += 1;
  }

  return 1 << count;
}

markov(states) {
  states.forEach(state => {
    let totalProb = 0;
    for (let prob in state.probs) {
      totalProb += state.probs[prob];
    }
    for (let prob in state.probs) {
      state.probs[prob] /= totalProb;
    }
    state.transition = function() {
      let rand = Math.random();
      let cumulativeProb = 0;
      for (let nextState in this.probs) {
        cumulativeProb += this.probs[nextState];
        if (rand < cumulativeProb) {
          return nextState;
        }
      }
    }
  });

  this.data = this.data.map(value => {
    let state = states.find(state => state.value === value);
    if (!state) {
      throw new Error(`No state found in markov() for value: ${value}`);
    }
    let newStateName = state.transition();
    let newState = states.find(state => state.name === newStateName);
    return newState.value;
  });
  return this;
}

grow2d(iterations, prob, threshold = 0, mode = 0) {
  // convert to a 2D array
  let size = Math.sqrt(this.data.length);
  let data2d = [];
  for (let i = 0; i < size; i++) {
    data2d[i] = this.data.slice(i * size, i * size + size);
  }

  // loop through every value in 2D array _iterations_ number of times
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let condition = (mode == 1 && data2d[i][j] > threshold) || (mode == 0 && data2d[i][j] < threshold);
        if (condition) {
          // set _prob_ adjacent values also to the current cell's value
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (Math.random() < prob && i + di >= 0 && i + di < size && j + dj >= 0 && j + dj < size) {
                data2d[i + di][j + dj] = data2d[i][j];
              }
            }
          }
        }
      }
    }
  }
  this.data = data2d.flat();
  return this;
}
  // END special operations

  // BEGIN utility functions used in other methods
  
  butterworthFilter(order, cutoff) {
    let gain = 0;
    let roots = [];
    for (let i = 0; i < 2 * order; i++) {
        let angle = (Math.PI / 2) * (2 * i + 1) / (2 * order);
        let real = -cutoff * Math.sin(angle);
        let imag = cutoff * Math.cos(angle);
        roots.push([real, imag]);
        gain += Math.sqrt(real * real + imag * imag);
    }
    gain = Math.pow(0.5 / gain, order);
    return { gain: gain, roots: roots };
  }

  parseKeyAndScale(key_letter = "C", key_scale = "major") {
    let chroma_key;
    key_letter = key_letter.toLowerCase();
    // if key_string is facet_pattern, create chroma_key from that
    if ( this.isFacetPattern(key_scale ) ) {
      if ( key_scale.data.length < 12 ) {
        key_scale.append(new FacetPattern().from(0).dup(11)).truncate(12);
      }
      chroma_key = key_scale.data.join();
      chroma_key = chroma_key.replace(/,/g, "");
    }
    else {
      chroma_key = Tonal.Scale.get(key_scale).chroma;
    }

    if ( key_letter == 'a' ) {
      chroma_key = this.stringLeftRotate(chroma_key,3);
    }
    else if ( key_letter == 'a#' ) {
      chroma_key = this.stringLeftRotate(chroma_key,2);
    }
    else if ( key_letter == 'b' ) {
      chroma_key = this.stringLeftRotate(chroma_key,1);
    }
    else if ( key_letter == 'c' ) {
      // no rotation needed, chroma defaults to c at root
    }
    else if ( key_letter == 'c#' ) {
      chroma_key = this.stringRightRotate(chroma_key,1);
    }
    else if ( key_letter == 'd' ) {
      chroma_key = this.stringRightRotate(chroma_key,2);
    }
    else if ( key_letter == 'd#' ) {
      chroma_key = this.stringRightRotate(chroma_key,3);
    }
    else if ( key_letter == 'e' ) {
      chroma_key = this.stringRightRotate(chroma_key,4);
    }
    else if ( key_letter == 'f' ) {
      chroma_key = this.stringRightRotate(chroma_key,5);
    }
    else if ( key_letter == 'f#' ) {
      chroma_key = this.stringRightRotate(chroma_key,6);
    }
    else if ( key_letter == 'g' ) {
      chroma_key = this.stringRightRotate(chroma_key,7);
    }
    else if ( key_letter == 'g#' ) {
      chroma_key = this.stringRightRotate(chroma_key,8);
    }
    return chroma_key;
  }
  
  getMaximumValue () {
    let max = Math.max.apply(Math, this.data);
    let min = Math.abs(Math.min.apply(Math, this.data));
    return max > min ? max : min;
  }

  sliceEndFade(array) {
    // since this is to smooth clicks in audio data, don't crossfade any "data" patterns with <= 1024 values
    let totalLength = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] != undefined) {
        totalLength += array[i].length;
      }
    }
    if ( totalLength <= 1024 ) {
      return array;
    }
    let result = [...array];
    let fadeLength = Math.floor(0.002 * SAMPLE_RATE);
    for (let i = array.length - fadeLength; i < array.length; i++) {
      let t = (i - (array.length - fadeLength)) / fadeLength;
      result[i] = array[i] * (1 - t);
      if (isNaN(result[i])) {
        result[i] = 0;
      }
    }
    return result;
  }

  fixnan () {
    for (var i = 0; i < this.data.length; i++) {
      if (isNaN(this.data[i])) {
        this.data[i] = 0;
      }
    }
    return this;
  }

  fadeArrays (arrays) {
    // since this is to smooth clicks in audio data, don't crossfade any "data" patterns with <= 1024 values
    let totalLength = 0;
    for (let i = 0; i < arrays.length; i++) {
      if (arrays[i] != undefined) {
        totalLength += arrays[i].length;
      }
    }
    if ( totalLength <= 1024 ) {
      return arrays;
    }
    let result = [];
    let fadeLength = Math.floor(0.002 * SAMPLE_RATE);
    for (let i = 0; i < arrays.length; i++) {
      result.push(...arrays[i].slice(0, -fadeLength));
      if (i < arrays.length - 1) {
        let startValue = arrays[i][arrays[i].length - fadeLength - 1];
        let endValue = arrays[i + 1][0];
        for (let j = 0; j < fadeLength; j++) {
          let t = j / fadeLength;
          let value = startValue + t * (endValue - startValue);
          if (isNaN(value)) {
            value = 0;
          }
          result.push(value);
        }
      } else {
        result.push(...arrays[i].slice(-fadeLength));
      }
    }
    return result;
  }

  convertSamplesToSeconds(samps) {
    return (Math.round((samps / SAMPLE_RATE) * 1000) / 1000);
  }

  flatten () {
    let out = [];
    Object.values(this.data).forEach(step => {
      if ( Array.isArray(step) ) {
        for (var i = 0; i < step.length; i++) {
          out.push(step[i]);
        }
      }
      else {
        out.push(step);
      }
    });
    this.data = out;
    return this;
  }

  stringLeftRotate(str, d) {
    return str.substring(d, str.length) + str.substring(0, d);
  }


  stringRightRotate(str, d) {
    return this.stringLeftRotate(str, str.length - d);
  }

  isFacetPattern(t) {
    if ( typeof t == 'object' && t.constructor.name == 'FacetPattern' ) {
      return true;
    }
    else {
      return false;
    }
  }

  makePatternsTheSameSize (sequence1, sequence2) {
    // make whichever one is smaller, fit the larger one's size.
    if ( sequence1.data.length > sequence2.data.length ) {
      sequence2 = sequence2.speed(sequence2.data.length / sequence1.data.length);
    }
    else if ( sequence2.data.length > sequence1.data.length ) {
      sequence1 = sequence1.speed(sequence1.data.length / sequence2.data.length);
    }
    return [sequence1, sequence2];
  }

  prevPowerOf2 (n) {
      var count = -1;
      if ( n && ! ( n & ( n - 1 ))) {
        return n;
      }
      while ( n != 0) {
        n >>= 1;
        count += 1;
      }
      return 1 << count;
  }

  minimum () {
    let min = this.data[0];
    for (let i = 1; i < this.data.length; i++) {
        if (this.data[i] < min) {
            min = this.data[i];
        }
    }
    return min;
  }

  maximum () {
    let max = this.data[0];
    for (let i = 1; i < this.data.length; i++) {
        if (this.data[i] > max) {
            max = this.data[i];
        }
    }
    return max;
  }

  // END utility functions


  // maxFrameSize allows you to hard-code the range that the data will get appended to, so that if you're
  // iteratively superposing stuff, the relative positions don't change as you add stuff to the data
  sup (addPattern, startPositions = 0, maxFrameSize = SAMPLE_RATE ) {
    if ( !this.isFacetPattern(addPattern) ) {
      throw `input must be a FacetPattern object; type found: ${typeof addPattern}`;
    }
    if (typeof startPositions == 'number' || Array.isArray(startPositions) === true) {
      startPositions = new FacetPattern().from(startPositions);
    }
    if (this.data.length == 0) {
      this.data = new FacetPattern().silence(maxFrameSize).data;
    }
    startPositions = startPositions.data;
    maxFrameSize = Math.abs(Math.floor(maxFrameSize));
    let output = this.data.slice();
    for (let j = 0; j < startPositions.length; j++) {
      let startPosition = startPositions[j];
      let start = Math.floor(startPosition * maxFrameSize);
      for (let i = 0; i < addPattern.data.length; i++) {
        if (start + i < this.data.length) {
            output[start + i] += addPattern.data[i];
        } else if (output.length < (maxFrameSize+addPattern.data.length)) {
            output.push(addPattern.data[i]);
        } else {
            break;
        }
      }
    }
    this.data = output;
    return this;
  }

  splice (splicePattern, relativePosition) {
    if ( !this.isFacetPattern(splicePattern) ) {
      throw `input must be a FacetPattern object; type found: ${typeof splicePattern}`;
    }
    relativePosition = Math.abs(relativePosition);
    let position = Math.round(relativePosition * this.data.length);
    this.data.splice(position, splicePattern.data.length, ...splicePattern.data);
    return this;
  }



  rotate (angle) {
    let width = Math.round(Math.sqrt(this.data.length));
    let height = width;

    // Wrap the angle to be between 0 and 360
    angle = (angle + 360) % 360;
    if ( angle < 0 ) {
      throw `rotate() cannot be called without a positive angle value`;
    }
    
    // Step 1: Scale up the image by a factor of 2
    const scale = 2;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    const scaledFloatArray = new Float32Array(scaledWidth * scaledHeight);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = y * width + x;
        for (let sy = y * scale; sy < (y + 1) * scale; sy++) {
          for (let sx = x * scale; sx < (x + 1) * scale; sx++) {
            const dstIdx = sy * scaledWidth + sx;
            scaledFloatArray[dstIdx] = this.data[srcIdx];
          }
        }
      }
    }
    
    // Step 2: Rotate the scaled image using a standard rotation algorithm
    const rotatedScaledFloatArray = new Float32Array(scaledWidth * scaledHeight);

    const centerX = scaledWidth / 2;
    const centerY = scaledHeight / 2;

    const rad = (angle % 360) * Math.PI / 180;

    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const tx = x - centerX;
        const ty = y - centerY;
        const rx = tx * Math.cos(rad) - ty * Math.sin(rad);
        const ry = tx * Math.sin(rad) + ty * Math.cos(rad);
        const ux = Math.round(rx + centerX);
        const uy = Math.round(ry + centerY);
        
        // Wrap the values around the image using modulo operation
        const wrappedUx = ((ux % scaledWidth) + scaledWidth) % scaledWidth;
        const wrappedUy = ((uy % scaledHeight) + scaledHeight) % scaledHeight;
        
        if (wrappedUx >= 0 && wrappedUx < scaledWidth && wrappedUy >= 0 && wrappedUy < scaledHeight) {
          const srcIdx = wrappedUy * scaledWidth + wrappedUx;
          const dstIdx = y * scaledWidth + x;
          rotatedScaledFloatArray[dstIdx] = scaledFloatArray[srcIdx];
        }
      }
    }
    
    // Step3: Scale down the rotated image to its original size
     this.size(width*height);
     const rotatedFloatArray = new Float32Array(this.data.length);
     
     for (let y = 0; y < height; y++) {
       for (let x = 0; x < width; x++) {
         let sum = 0;
         let count = 0;
         for (let sy = y * scale; sy < (y +1) * scale; sy++) {
           for (let sx= x*scale; sx< (x+1)*scale;sx++){
             sum += rotatedScaledFloatArray[sy*scaledWidth+sx];
             count++;
           }
         }
         rotatedFloatArray[y*width+x]=sum/count;
       }
     }
     
     this.data=rotatedFloatArray;
     this.fixnan();
     this.flatten();
     return this;
    }  

  layer2d ( brightness_data, xCoords, yCoords) {
    let width = Math.round(Math.sqrt(this.data.length));
    let height = width;
    if ( !brightness_data ) {
      throw `layer2d() cannot be called without a brightness argument`;
    }
    if ( !xCoords ) {
      throw `layer2d() cannot be called without a xCoords argument`;
    }
    if ( !yCoords ) {
      throw `layer2d() cannot be called without a yCoords argument`;
    }
    if (!width || width <= 0 ) {
      throw `layer2d() cannot be called without a width value < 0`;
    }
    width = Math.round(width);
    if (!height || height <= 0 ) {
      throw `layer2d() cannot be called without a height value < 0`;
    }
    height = Math.round(height);

    // create a new array with the specified dimensions
    let screen = new Array(height);
    for (let i = 0; i < height; i++) {
        screen[i] = new Array(width);
    }

    if (typeof brightness_data == 'number' || Array.isArray(brightness_data) === true) {
      brightness_data = new FacetPattern().from(brightness_data);
    }
    if (typeof xCoords == 'number' || Array.isArray(xCoords) === true) {
      xCoords = new FacetPattern().from(xCoords);
    }
    if (typeof yCoords == 'number' || Array.isArray(yCoords) === true) {
      yCoords = new FacetPattern().from(yCoords);
    }

    xCoords.size(brightness_data.data.length);
    yCoords.size(brightness_data.data.length);

    // write the brightness data to the screen
    for (let i = 0; i < brightness_data.data.length; i++) {
        let x = Math.round(xCoords.data[i]);
        let y = Math.round(yCoords.data[i]);
        if (x >= 0 && x < width && y >= 0 && y < height) {
          screen[y][x] = brightness_data.data[i];
        }
    }
    brightness_data.data = screen;
    brightness_data.flatten().fixnan();
    this.sup(brightness_data);
    this.fixnan();
    return this;
  }

  shift2d (x, y) {
    let width = Math.round(Math.sqrt(this.data.length));
    let height = width;
    // create a new array to hold the moved values
    let movedArr = new Array(this.data.length);
    // loop through each value in the original array
    for (let i = 0; i < height * width; i++) {
        // calculate the current row and column in the 2D space
        let row = Math.floor(i / width);
        let col = i % width;
        // calculate the new row and column after moving
        let newRow = (row + y + height) % height;
        let newCol = (col + x + width) % width;
        // move the value to the new position in the moved array
        let newIndex = newRow * width + newCol;
        movedArr[newIndex] = this.data[i];
    }
    this.data = movedArr;
    return this;
}

circle2d(centerX, centerY, radius, value, mode = 0) {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  for (let i = 0; i < height * width; i++) {
      let row = Math.floor(i / width);
      let col = i % width;
      // calculate distance from the current position to the center point
      let distance = Math.sqrt(Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2));

      // if mode is 0, only draw the outline by checking if the distance is close to the radius
      // if mode is 1, fill the circle by checking if the distance is less than or equal to the radius
      if ((mode === 0 && Math.abs(distance - radius) < 1) || (mode === 1 && distance <= radius)) {
          this.data[i] = value;
      }
  }
  return this;
}

draw2d(coordinates, fillValue) {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  if (fillValue === undefined) {
    throw new Error("fillValue is required for draw2d.");
  }
  if (coordinates.length % 2 !== 0) {
    throw new Error("Invalid number of coordinates for draw2d. The array length must be divisible by 2.");
  }

  // create a 2D array with the dimensions of the polygon
  let polygon = new Array(height).fill(null).map(() => new Array(width).fill(0));
  let points = [];
  for (let i = 0; i < coordinates.length; i += 2) {
    points.push({x: coordinates[i], y: coordinates[i + 1]});
  }

  // process each pair of points
  for (let i = 0; i < points.length - 1; i++) {
    let start = points[i];
    let end = points[i + 1];

    // check if the points are within the bounds of the polygon
    if (start.x < 0 || start.x >= width || end.x < 0 || end.x >= width || start.y < 0 || start.y >= height || end.y < 0 || end.y >= height) {
      throw new Error(`Coordinates (${start.x}, ${start.y}) or (${end.x}, ${end.y}) are out of bounds.`);
    }

    // fill the line between the points with the fill value
    let dx = Math.abs(end.x - start.x);
    let dy = Math.abs(end.y - start.y);
    let sx = (start.x < end.x) ? 1 : -1;
    let sy = (start.y < end.y) ? 1 : -1;
    let err = dx - dy;

    while(true){
      polygon[start.y][start.x] = fillValue;

      if ((start.x === end.x) && (start.y === end.y)) break;
      let e2 = 2*err;
      if (e2 > -dy) { err -= dy; start.x  += sx; }
      if (e2 < dx) { err += dx; start.y += sy; }
    }
  }

  // wpdate the data property with the new polygon
  this.data = polygon.flat();
  return this;
}

rect2d(topLeftX, topLeftY, rectWidth, rectHeight, value, mode = 0) {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  for (let i = 0; i < height * width; i++) {
      let row = Math.floor(i / width);
      let col = i % width;

      // if mode is 0, only draw the outline by checking if the point is on the edge of the rectangle
      // if mode is 1, fill the rectangle by checking if the point is within the rectangle
      if ((mode === 0 && ((col === topLeftX || col === topLeftX + rectWidth - 1) && row >= topLeftY && row < topLeftY + rectHeight) || 
                          ((row === topLeftY || row === topLeftY + rectHeight - 1) && col >= topLeftX && col < topLeftX + rectWidth)) || 
          (mode === 1 && col >= topLeftX && col < topLeftX + rectWidth && row >= topLeftY && row < topLeftY + rectHeight)) {
          this.data[i] = value;
      }
  }
  return this;
}

tri2d(x1, y1, x2, y2, x3, y3, value, mode = 0) {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  for (let i = 0; i < height * width; i++) {
      let row = Math.floor(i / width);
      let col = i % width;

      // calculate the barycentric coordinates for the current position
      let w1 = ((y2 - y3) * (col - x3) + (x3 - x2) * (row - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
      let w2 = ((y3 - y1) * (col - x3) + (x1 - x3) * (row - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
      let w3 = 1 - w1 - w2;

      // if mode is 0, only draw the outline by checking if the point is close to one of the edges
      // if mode is 1, fill the triangle by checking if the point is within the triangle
      if ((mode === 0 && (Math.abs(w1) < 0.05 || Math.abs(w2) < 0.05 || Math.abs(w3) < 0.05)) || (mode === 1 && w1 >= 0 && w2 >= 0 && w3 >= 0)) {
          this.data[i] = value;
      }
  }
  return this;
}

palindrome2d() {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  let newWidth = width * 2;
  let newHeight = height * 2;
  let mirroredData = new Array(newWidth * newHeight).fill(0);

  for (let row = 0; row < newHeight; row++) {
    for (let col = 0; col < newWidth; col++) {
      let originalRow = row < height ? row : newHeight - row - 1;
      let originalCol = col < width ? col : newWidth - col - 1;
      mirroredData[row * newWidth + col] = this.data[originalRow * width + originalCol];
    }
  }

  this.data = mirroredData;
  return this;
}

walk2d (percentage, x, y, mode = 0) {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  let movedArr = [...this.data]; // copy the original data
  let numToMove = Math.floor(percentage * this.data.length);

  // if x or y is not an array, convert it to an array with the same min and max value
  if (!Array.isArray(x)) x = [x, x];
  if (!Array.isArray(y)) y = [y, y];

  for (let i = 0; i < numToMove; i++) {
      let index = Math.floor(Math.random() * this.data.length);
      let row = Math.floor(index / width);
      let col = index % width;

      // calculate new position
      let newRow = row + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * (y[1] - y[0] + 1) + y[0]);
      let newCol = col + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * (x[1] - x[0] + 1) + x[0]);

      switch(mode) {
          case 0: // wrap
              if (newRow < 0) newRow += height;
              if (newRow >= height) newRow -= height;
              if (newCol < 0) newCol += width;
              if (newCol >= width) newCol -= width;
              break;
          case 1: // fold
              if (newRow < 0) newRow = -newRow;
              if (newRow >= height) newRow = 2*height - newRow - 1;
              if (newCol < 0) newCol = -newCol;
              if (newCol >= width) newCol = 2*width - newCol - 1;
              break;
          case 2: // clip
              if (newRow < 0) newRow = 0;
              if (newRow >= height) newRow = height - 1;
              if (newCol < 0) newCol = 0;
              if (newCol >= width) newCol = width - 1;
              break;
      }

      // move the value to the new position in the moved array
      let newIndex = newRow * width + newCol;
      movedArr[newIndex] = this.data[index];
  }

  this.data = movedArr;
  return this;
}

warp2d(warpX, warpY, warpIntensity) {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  let warpedData = new Array(this.data.length).fill(0);

  for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
          // calculate the distance from the current point to the warp point
          let dx = warpX - col;
          let dy = warpY - row;
          let distance = Math.sqrt(dx * dx + dy * dy);

          // calculate the warp factor based on the distance and the warp intensity
          let warpFactor = warpIntensity * Math.exp(-distance / (width * warpIntensity)); // exponential decay

          // calculate the new position after applying the warp effect
          let warpedRow = row + dy * warpFactor;
          let warpedCol = col + dx * warpFactor;

          // clip the new position to the range [0, width) and [0, height)
          warpedRow = Math.max(0, Math.min(height - 1, Math.round(warpedRow)));
          warpedCol = Math.max(0, Math.min(width - 1, Math.round(warpedCol)));

          // move the value to the new position in the warped array
          let index = row * width + col;
          let warpedIndex = warpedRow * width + warpedCol;
          warpedData[warpedIndex] = this.data[index];
      }
  }

  this.data = warpedData;
  return this;
}

delay2d(delayX, delayY, intensityDecay = 0.5) {
  let width = Math.round(Math.sqrt(this.data.length));
  let height = width;
  if (intensityDecay < 0 ) {
    intensityDecay = 0;
  }
  if (intensityDecay > 1 ) {
    intensityDecay = 1;
  }
  let delayedData = new Array(this.data.length).fill(0);
  let totalDelays = Math.round(1 / (1 - intensityDecay));

  for (let delay = 0; delay < totalDelays; delay++) {
      let decayFactor = 1 - (intensityDecay * delay / totalDelays);
      for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
              let delayedRow = delayY >= 0 ? ((row + delay * delayY) + height) % height : ((row - delay * Math.abs(delayY)) + height) % height;
              let delayedCol = delayX >= 0 ? ((col + delay * delayX) + width) % width : ((col - delay * Math.abs(delayX)) + width) % width;
              let index = delayedRow * width + delayedCol;
              delayedData[index] += this.data[row * width + col] * decayFactor;
              // clip the value at the current index to the range [0, 1]
              delayedData[index] = Math.max(0, Math.min(1, delayedData[index]));
          }
      }
  }

  this.data = delayedData;
  return this;
}

  rechunk2d( chunks) {
    if (Math.sqrt(chunks) % 1 !== 0) {
        throw new Error('The number of chunks must have an integer square root');
    }
    let nextLargerSquare = Math.ceil(Math.sqrt(this.data.length));
    while (nextLargerSquare * nextLargerSquare % chunks !== 0) {
      nextLargerSquare++;
    }
    this.size(nextLargerSquare * nextLargerSquare);
    const chunkSize = this.data.length / chunks;
    const chunkSide = Math.sqrt(chunkSize);
    const side = Math.sqrt(this.data.length);
    let result = new Array(this.data.length);
    let chunkOrder = [...Array(chunks).keys()];
    for (let i = chunkOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chunkOrder[i], chunkOrder[j]] = [chunkOrder[j], chunkOrder[i]];
    }
    for (let i = 0; i < chunks; i++) {
        let chunkStartRow = Math.floor(chunkOrder[i] / Math.sqrt(chunks)) * chunkSide;
        let chunkStartCol = (chunkOrder[i] % Math.sqrt(chunks)) * chunkSide;
        let resultStartRow = Math.floor(i / Math.sqrt(chunks)) * chunkSide;
        let resultStartCol = (i % Math.sqrt(chunks)) * chunkSide;
        for (let j = 0; j < chunkSide; j++) {
            for (let k = 0; k < chunkSide; k++) {
                result[(resultStartRow + j) * side + resultStartCol + k] = this.data[(chunkStartRow + j) * side + chunkStartCol + k];
            }
        }
    }
    this.data = result;
    return this;
  }

  mutechunks2d (chunks, probability) {
    if (Math.sqrt(chunks) % 1 !== 0) {
        throw new Error('The number of chunks must have an integer square root');
    }
    let nextLargerSquare = Math.ceil(Math.sqrt(this.data.length));
    while (nextLargerSquare * nextLargerSquare % chunks !== 0) {
      nextLargerSquare++;
    }
    this.size(nextLargerSquare * nextLargerSquare);
    const chunkSize = this.data.length / chunks;
    const chunkSide = Math.sqrt(chunkSize);
    const side = Math.sqrt(this.data.length);
    let result = new Array(this.data.length);
    let chunkOrder = [...Array(chunks).keys()];
    for (let i = chunkOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chunkOrder[i], chunkOrder[j]] = [chunkOrder[j], chunkOrder[i]];
    }
    for (let i = 0; i < chunks; i++) {
        let chunkStartRow = Math.floor(chunkOrder[i] / Math.sqrt(chunks)) * chunkSide;
        let chunkStartCol = (chunkOrder[i] % Math.sqrt(chunks)) * chunkSide;
        let resultStartRow = Math.floor(i / Math.sqrt(chunks)) * chunkSide;
        let resultStartCol = (i % Math.sqrt(chunks)) * chunkSide;
        if (Math.random() < probability) {
            for (let j = 0; j < chunkSide; j++) {
                for (let k = 0; k < chunkSide; k++) {
                    result[(resultStartRow + j) * side + resultStartCol + k] = 0;
                }
            }
        } else {
            for (let j = 0; j < chunkSide; j++) {
                for (let k = 0; k < chunkSide; k++) {
                    result[(resultStartRow + j) * side + resultStartCol + k] = this.data[(chunkStartRow + j) * side + chunkStartCol + k];
                }
            }
        }
    }
    this.data = result;
    return this;
  }

  size2d ( size ) {
    if (size <= 0 || size > 1) {
        throw new Error('size2d() requires a size between 0 and 1');
    }

    // Calculate the dimensions of the square
    let squareSize = Math.ceil(Math.sqrt(this.data.length));
    let newSize = Math.floor(squareSize * size);

    // Create the 2D square array
    let square = [];
    for (let i = 0; i < newSize; i++) {
        let row = [];
        for (let j = 0; j < newSize; j++) {
            // Use linear interpolation to find the corresponding index in the original data
            let index = Math.floor((i / newSize) * squareSize) * squareSize + Math.floor((j / newSize) * squareSize);
            row.push(this.data[index]);
        }
        square.push(row);
    }
    this.data = square;
    this.flatten();
    return this;
}

  slices (num_slices, command, prob = 1, yes_fade = true) {
    let out_fp = new FacetPattern();
    prob = Math.abs(Number(prob));
    num_slices = Math.abs(Math.round(Number(num_slices)));
    if ( num_slices == 0 ) {
      return sequence;
    }
    if ( typeof command != 'function' ) {
      throw `3rd argument must be a function, type found: ${typeof command}`;
    }
    this.current_total_slices = num_slices;
    command = command.toString();
    command = command.replace(/this./g, 'current_slice.');
    command = command.slice(command.indexOf("{") + 1, command.lastIndexOf("}"));
    let calc_slice_size = Math.round(this.data.length / num_slices);
    let slice_start_pos, slice_end_pos;
    let current_slice;
    let i = this.current_iteration_number;
    let iters = this.current_total_iterations;
    for (var s = 0; s < num_slices; s++) {
      this.current_slice_number = s;
      slice_start_pos = s * calc_slice_size;
      slice_end_pos = slice_start_pos + calc_slice_size;
      current_slice = new FacetPattern().from(this.data).range(slice_start_pos/this.data.length, slice_end_pos/this.data.length);
      if ( Math.random() < prob ) {
        current_slice = eval(command);
      }
      if (this.data.length >= 1024 && yes_fade == true) {
        out_fp.sup(current_slice.fadeout(0.01),s/num_slices,this.data.length);
      }
      else {
        // no fade on sizes < 1024 so that it can run on control data too
        out_fp.sup(current_slice,s/num_slices,this.data.length);
      }
    }
    this.data = out_fp.data;
    this.flatten();
    return this;
  }

  iter (iters, command, prob = 1) {
    this.original_data = this.data;
    prob = Math.abs(Number(prob));
    iters = Math.abs(Math.round(Number(iters)));
    if ( iters == 0 ) {
      return this;
    }
    if ( typeof command != 'function' ) {
      throw `3rd argument to .iter() must be a function, type found: ${typeof command}`;
    }
    this.current_total_iterations = iters;
    command = command.toString();
    command = command.replace(/current_slice./g, 'this.');
    command = command.slice(command.indexOf("{") + 1, command.lastIndexOf("}"));
    let s = this.current_slice_number;
    let num_slices = this.current_total_slices;
    for (var i = 0; i < iters; i++) {
      this.current_iteration_number = i;
      if ( Math.random() < prob ) {
        eval(command);
      }
    }
    return this;
  }

  parallel (commands) {
    if ( typeof commands != 'object' && Array.isArray(commands) == false ) {
      throw `input to parallel() must be an array of functions, type found: ${typeof commands}`;
    }
    let initial_maximum_value = this.getMaximumValue();
    let out_fp = new FacetPattern();
    let initial_fp = new FacetPattern().from(this.data);
    let i = this.current_iteration_number;
    let iters = this.current_total_iterations;
    let s = this.current_slice_number;
    let num_slices = this.current_total_slices;
    for (let [key, command] of Object.entries(commands)) {
      this.data = initial_fp.data;
      command = command.toString();
      command = command.replace(/current_slice./g, 'this.');
      command = command.slice(command.indexOf("{") + 1, command.lastIndexOf("}"));
      eval(command);
      out_fp.sup(this,0);
    }
    this.data = out_fp.data;
    this.fixnan();
    this.full(initial_maximum_value);
    return this;
  }

  sometimes (prob, command) {
    if ( typeof command != 'function' ) {
      throw `2nd argument must be a function, type found: ${typeof command}`;
    }
    command = command.toString();
    command = command.replace(/current_slice./g, 'this.');
    command = command.slice(command.indexOf("{") + 1, command.lastIndexOf("}"));
    prob = Math.abs(Number(prob));
    let i = this.current_iteration_number;
    let iters = this.current_total_iterations;
    let s = this.current_slice_number;
    let num_slices = this.current_total_slices;
    if ( Math.random() < prob ) {
      eval(command);
    }
    return this;
  }

  run (command) {
    this.sometimes(1,command);
    return this;
  }

  mix ( wet, command) {
    if ( typeof command != 'function' ) {
      throw `2nd argument must be a function, type found: ${typeof command}`;
    }
    command = command.toString();
    command = command.slice(command.indexOf("{") + 1, command.lastIndexOf("}"));
    command = command.replace(/current_slice./g, 'this.');
    wet = Math.abs(Number(wet));
    let dry = Math.abs(wet-1);
    let dry_data = new FacetPattern().from(this.data).times(dry);
    let i = this.current_iteration_number;
    let iters = this.current_total_iterations;
    let s = this.current_slice_number;
    let num_slices = this.current_total_slices;
    eval(command);
    let wet_data = new FacetPattern().from(this.data).times(wet);
    let mixed_data = dry_data.sup(wet_data, 0);
    this.data = mixed_data.data;
    return this;
  }

  sample(name) {
    if (!name.endsWith('.wav')) {
        name += '.wav';
    }
    let audioBuffer = audioBuffers[name];
    if (audioBuffer) {
        this.data = audioBuffer;
    } else {
        throw `No buffer found with the name ${name}`;
    }
    return this;
  }

}

function $ (n) {
	if (!n) {
	  return new FacetPattern(Math.random());
	}
	else {
	  return new FacetPattern(n);
	}
  }
  
  function choose (list) {
	return list[Math.floor(Math.random()*list.length)];
  }
  
  function decide () {
	return Math.random() > 0.5 ? 1 : 0;
  }
  
  function cof (index) {
	return ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'][index%12];
  }
  
  function ftom(frequency) {
	return Math.round(12 * Math.log2(frequency / 440) + 69);
  }
  
  function ms (ms) {
	return Math.round(Math.abs(Number(ms)) * (SAMPLE_RATE*0.001));
  }
  
  function mtof(note) {
	note = Math.abs(Number(note));
	return Math.pow(2,(note-69)/12) * 440;
  }
  
  function ri (min = 0, max = 1, weight = 1) {
	return random(min,max,1,weight);
  }
  
  function rf (min = 0, max = 1, weight = 1) {
	return random(min,max,0,weight);
  }
  
  function random(min = 0, max = 1, int_mode = 0, weight = 1) {
	let num = Math.pow(Math.random(), weight) * (Number(max) - Number(min)) + Number(min);
	if (int_mode != 0) {
		num = Math.round(num);
	}
	return num;
  }
  
  function randscale() {
	let all_scales = ["major pentatonic", "major", "minor", "major blues", "minor blues", "melodic minor", "harmonic minor", "bebop", "diminished", "dorian", "lydian", "mixolydian", "phrygian", "locrian", "ionian pentatonic", "mixolydian pentatonic", "ritusen", "egyptian", "neopolitan major pentatonic", "vietnamese 1", "pelog", "kumoijoshi", "hirajoshi", "iwato", "in-sen", "lydian pentatonic", "malkos raga", "locrian pentatonic", "minor pentatonic", "minor six pentatonic", "flat three pentatonic", "flat six pentatonic", "scriabin", "whole tone pentatonic", "lydian #5P pentatonic", "lydian dominant pentatonic", "minor #7M pentatonic", "super locrian pentatonic", "minor hexatonic", "augmented", "piongio", "prometheus neopolitan", "prometheus", "mystery #1", "six tone symmetric", "whole tone", "messiaen's mode #5", "locrian major", "double harmonic lydian", "altered", "locrian #2", "mixolydian b6", "lydian dominant", "lydian augmented", "dorian b2", "ultralocrian", "locrian 6", "augmented heptatonic", "dorian #4", "lydian diminished", "leading whole tone", "lydian minor", "phrygian dominant", "balinese", "neopolitan major", "harmonic major", "double harmonic major", "hungarian minor", "hungarian major", "oriental", "flamenco", "todi raga", "persian", "enigmatic", "major augmented", "lydian #9", "messiaen's mode #4", "purvi raga", "spanish heptatonic", "bebop minor", "bebop major", "bebop locrian", "minor bebop", "ichikosucho", "minor six diminished", "half-whole diminished", "kafi raga", "messiaen's mode #6", "composite blues", "messiaen's mode #3", "messiaen's mode #7", "chromatic"];
	return all_scales[Math.floor(Math.random()*all_scales.length)];
  }
  
  function mtos(midiNoteIn) {
	let frequency = Math.pow(2, (midiNoteIn - 69) / 12) * 440;
	let samples = SAMPLE_RATE / frequency;
	return samples;
  }
  
  function ts () {
	return Date.now();
  }
  
  function barmod(mod, values) {
	mod = Math.round(Math.abs(Number(mod)));
	if ( values.length % 2 != 0 ) {
	  throw (`barmod must contain an even number of values`);
	}
	let allNumbers = [];
	for (let i = 0; i < mod; i++) {
		allNumbers.push(i);
	}
	for (let i = 0; i < allNumbers.length; i++) {
		if (!values.some((value, index) => index % 2 === 0 && value === allNumbers[i])) {
			throw (`Error: every integer from 0 to ${mod-1} must be one of the even-numbered keys of the values array`);
		}
	}
	let result = bars % mod;
	for (let i = 0; i < values.length; i += 2) {
		if (values[i] === result) {
			return values[i + 1];
		}
	}
  }
  
  function scale(oldValue, oldMin, oldMax, newMin, newMax) {
	return (newMax - newMin) * (oldValue - oldMin) / (oldMax - oldMin) + newMin;
  }
  