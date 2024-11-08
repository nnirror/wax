importScripts('facetForWax.js', 'lib/Complex.js', 'lib/tonal.min.js');

let stored_patterns = {};

self.onmessage = function(event) {
    self.audioBuffers = event.data.audioBuffers;
    let code = event.data.code;
    try {
        const result = eval(code);
        if (result.set_pattern_name_after_evaluation !== false ) {
            stored_patterns[result.set_pattern_name_after_evaluation] = result.data;
        }
        self.postMessage(result);
    } catch (error) {
        self.postMessage({ error: error.toString() });
    }
};