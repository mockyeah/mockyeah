/**
 * Based on https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader#Examples
 */
const read = (stream: ReadableStream): Promise<string> => {
  const reader = stream.getReader();

  let result: string;

  const loop = (data: ReadableStreamReadResult<string>): string | Promise<string> => {
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

export default read;
