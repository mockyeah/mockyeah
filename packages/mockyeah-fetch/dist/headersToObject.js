"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fromPairs_1 = __importDefault(require("lodash/fromPairs"));
const headersToObject = (headers) => {
    if (!headers)
        return {};
    // @ts-ignore
    if (headers.entries) {
        // @ts-ignore
        const entries = headers.entries();
        return fromPairs_1.default([...entries].map(e => [e[0].toLowerCase(), e[1]]));
    }
    if (headers.forEach) {
        const object = {};
        headers.forEach((value, name) => {
            object[name] = value;
        });
        return object;
    }
    return {};
};
exports.headersToObject = headersToObject;
//# sourceMappingURL=headersToObject.js.map