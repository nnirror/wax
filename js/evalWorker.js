importScripts('facetForWax.js', 'lib/tonal.min.js');

self.onmessage = function(event) {
    self.audioBuffers = event.data.audioBuffers;
    let code = event.data.code;
    const result = eval(code);
    self.postMessage(result);
};