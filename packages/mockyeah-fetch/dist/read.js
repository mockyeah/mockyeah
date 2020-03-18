"use strict";
exports.__esModule = true;
/**
 * Based on https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader#Examples
 */
var read = function (stream) {
    var reader = stream.getReader();
    var result;
    var loop = function (data) {
        var done = data.done, value = data.value;
        // Result objects contain two properties:
        // done  - true if the stream has already given you all its data.
        // value - some data. Always undefined when done is true.
        if (done) {
            return result;
        }
        var chunk = value;
        result = result || '';
        result += chunk;
        // Read some more, and call this function again
        return reader.read().then(loop);
    };
    // read() returns a promise that resolves
    // when a value has been received
    return reader.read().then(loop);
};
exports["default"] = read;
