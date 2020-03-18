"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fromPairs_1 = __importDefault(require("lodash/fromPairs"));
var headersToObject = function (headers) {
    if (!headers)
        return {};
    // @ts-ignore
    if (headers.entries) {
        // @ts-ignore
        var entries = headers.entries();
        return fromPairs_1["default"](__spreadArrays(entries).map(function (e) { return [e[0].toLowerCase(), e[1]]; }));
    }
    if (headers.forEach) {
        var object_1 = {};
        headers.forEach(function (value, name) {
            object_1[name] = value;
        });
        return object_1;
    }
    return {};
};
exports.headersToObject = headersToObject;
