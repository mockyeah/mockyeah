"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Based on https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader#Examples
 */
const read = (stream) => {
    const reader = stream.getReader();
    let result;
    const loop = (data) => {
        const { done, value } = data;
        // Result objects contain two properties:
        // done  - true if the stream has already given you all its data.
        // value - some data. Always undefined when done is true.
        if (done) {
            return result;
        }
        const chunk = value;
        result = result || '';
        result += chunk;
        // Read some more, and call this function again
        return reader.read().then(loop);
    };
    // read() returns a promise that resolves
    // when a value has been received
    return reader.read().then(loop);
};
exports.default = read;
//# sourceMappingURL=read.js.map