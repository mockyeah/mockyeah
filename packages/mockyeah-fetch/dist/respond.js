"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mime_1 = __importDefault(require("mime"));
const handler = (value, requestForHandler) => typeof value === 'function' ? value(requestForHandler) : value;
const respond = async (matchingMock, requestForHandler, options) => {
    const { responseHeaders } = options;
    const resOpts = matchingMock[1] || {};
    const status = (resOpts.status && (await handler(resOpts.status, requestForHandler))) || 200;
    let body;
    const awaitedType = (resOpts.type && (await resOpts.type));
    let type;
    if (typeof awaitedType === 'function') {
        type = awaitedType(requestForHandler);
    }
    else {
        type = awaitedType;
    }
    let contentType;
    let json;
    if (resOpts.fixture) {
        if (!options.fixtureResolver) {
            throw new Error('Using `fixture` in mock response options requires a `fixtureResolver`.');
        }
        const fixture = await handler(resOpts.fixture, requestForHandler);
        type = type || fixture; // TODO: Use base name only to conceal file path?
        body = fixture ? await options.fixtureResolver(fixture) : undefined;
    }
    else if (resOpts.filePath) {
        if (!options.fileResolver) {
            throw new Error('Using `filePath` in mock response options requires a `fileResolver`.');
        }
        const filePath = await handler(resOpts.filePath, requestForHandler);
        type = type || filePath; // TODO: Use base name only to conceal file path?
        body = filePath ? await options.fileResolver(filePath) : undefined;
    }
    else if (resOpts.json) {
        json = await handler(resOpts.json, requestForHandler);
        body = JSON.stringify(json);
        contentType = 'application/json; charset=UTF-8';
    }
    else if (resOpts.text) {
        body = await handler(resOpts.text, requestForHandler);
        contentType = 'text/plain; charset=UTF-8';
    }
    else if (resOpts.html) {
        body = await handler(resOpts.html, requestForHandler);
        contentType = 'text/html; charset=UTF-8';
    }
    else if (resOpts.raw) {
        // TODO: This has different semantics that the Express version.
        body = await handler(resOpts.raw, requestForHandler);
        contentType = undefined;
    }
    body = body || '';
    contentType = type ? mime_1.default.getType(type) : contentType;
    const headers = resOpts.headers
        ? {
            ...(await handler(resOpts.headers, requestForHandler))
        }
        : {};
    if (responseHeaders) {
        headers['x-mockyeah-mocked'] = 'true';
    }
    if (contentType) {
        headers['content-type'] = contentType;
    }
    const responseInit = {
        status,
        headers
    };
    const latency = resOpts.latency || options.latency;
    if (latency) {
        const latencyActual = await handler(latency, requestForHandler);
        await new Promise(resolve => setTimeout(resolve, latencyActual));
    }
    const response = new Response(body, responseInit);
    // eslint-disable-next-line consistent-return
    return {
        response,
        json
    };
};
exports.respond = respond;
//# sourceMappingURL=respond.js.map