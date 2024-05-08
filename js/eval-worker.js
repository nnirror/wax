importScripts('facet_for_max.js');

self.onmessage = (event) => {
    const result = eval(event.data);
    self.postMessage(result);
};