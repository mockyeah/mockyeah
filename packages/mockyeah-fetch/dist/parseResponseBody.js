"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
const parseResponseBody = (headers, body) => {
    // TODO: Does this handle lowercase `content-type`?
    const contentType = headers && headers.get('Content-Type');
    // TODO: More robust content-type parsing.
    const isJson = contentType?.includes('application/json');
    const isForm = contentType?.includes('application/x-www-form-urlencoded');
    if (body) {
        if (isJson) {
            return JSON.parse(body);
        }
        if (isForm) {
            return qs_1.default.parse(body);
        }
    }
    return body;
};
exports.parseResponseBody = parseResponseBody;
//# sourceMappingURL=parseResponseBody.js.map