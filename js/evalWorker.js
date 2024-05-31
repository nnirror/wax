importScripts('facetForWax.js', 'lib/tonal.min.js');

self.onmessage = function(event) {
    self.audioBuffers = event.data.audioBuffers;
    let code = event.data.code;
    try {
        const result = eval(code);
        self.postMessage({ result: result });
    } catch (error) {
        self.postMessage({ error: error.toString() });
    }
};