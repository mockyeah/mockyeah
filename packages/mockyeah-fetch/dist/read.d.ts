/**
 * Based on https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader#Examples
 */
declare const read: (stream: ReadableStream<any>) => Promise<string>;
export default read;
