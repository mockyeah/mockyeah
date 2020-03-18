"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var qs_1 = __importDefault(require("qs"));
var parseResponseBody = function (headers, body) {
    var _a, _b;
    // TODO: Does this handle lowercase `content-type`?
    var contentType = headers && headers.get('Content-Type');
    // TODO: More robust content-type parsing.
    var isJson = (_a = contentType) === null || _a === void 0 ? void 0 : _a.includes('application/json');
    var isForm = (_b = contentType) === null || _b === void 0 ? void 0 : _b.includes('application/x-www-form-urlencoded');
    if (body) {
        if (isJson) {
            return JSON.parse(body);
        }
        if (isForm) {
            return qs_1["default"].parse(body);
        }
    }
    return body;
};
exports.parseResponseBody = parseResponseBody;
