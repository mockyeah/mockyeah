"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const qs_1 = __importDefault(require("qs"));
const path_to_regexp_1 = __importDefault(require("path-to-regexp"));
const isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
const isEmpty_1 = __importDefault(require("lodash/isEmpty"));
const isRegExp_1 = __importDefault(require("lodash/isRegExp"));
const decodedPortRegex = /^(\/?https?.{3}[^/:?]+):/;
const decodedProtocolRegex = /^(\/?https?).{3}/;
const encodedPortRegex = /^(\/?https?.{3}[^/:?]+)~/;
const encodedProtocolRegex = /^(\/?https?).{3}/;
// Restore any special protocol or port characters that were possibly tilde-replaced.
const decodeProtocolAndPort = (str) => str.replace(encodedProtocolRegex, '$1://').replace(encodedPortRegex, '$1:');
const encodeProtocolAndPort = (str) => str.replace(decodedPortRegex, '$1~').replace(decodedProtocolRegex, '$1~~~');
const stripQuery = (url) => {
    let parsed;
    // is absolute?
    if (/^https?:/.test(url)) {
        parsed = url_1.parse(url);
        url = `${parsed.protocol || 'http:'}//${parsed.hostname}${parsed.port && !['80', '443'].includes(parsed.port) ? `:${parsed.port}` : ''}${parsed.pathname}`;
    }
    else {
        parsed = url_1.parse(`http://example.com${url.startsWith('/') ? url : `/${url}`}`);
        url = parsed.pathname || '';
    }
    const query = parsed.query ? qs_1.default.parse(parsed.query) : undefined;
    return {
        url,
        query
    };
};
exports.stripQuery = stripQuery;
const leadingSlashRegex = /^\//;
const leadUrlEncodedProtocolRegex = /^(https?)%3A%2F%2F/;
const stripLeadingSlash = (url) => url.replace(leadingSlashRegex, '');
const makeRequestUrl = (url) => {
    const isAbsolute = /^\/+https?[:~][/~]{2}/.test(url);
    return isAbsolute
        ? decodeProtocolAndPort(stripLeadingSlash(url).replace(leadUrlEncodedProtocolRegex, (match, p1) => `${p1}://`))
        : url;
};
const normalize = (match, incoming) => {
    if (typeof match === 'function')
        return match;
    const originalMatch = isPlainObject_1.default(match) ? { ...match } : match;
    if (!isPlainObject_1.default(match)) {
        match = {
            url: match
        };
    }
    else {
        // shallow copy
        match = {
            // @ts-ignore
            ...match
        };
    }
    match.query = isEmpty_1.default(match.query) ? undefined : match.query;
    match.headers = isEmpty_1.default(match.headers)
        ? undefined
        : Object.entries(match.headers).reduce((acc, [k, v]) => {
            acc[k.toLowerCase()] = v;
            return acc;
        }, {});
    if (!match.method) {
        match.method = 'get';
    }
    else if (match.method === 'all' || match.method === 'ALL' || match.method === '*') {
        delete match.method;
    }
    else if (typeof match.method === 'string') {
        match.method = match.method.toLowerCase();
    }
    const $meta = { ...(match.$meta || {}) };
    if (match.path) {
        match.url = match.path;
        delete match.path;
    }
    if (match.url === '*') {
        delete match.url;
    }
    if (typeof match.url === 'string') {
        match.url = makeRequestUrl(match.url);
        const stripped = stripQuery(match.url);
        match.url = stripped.url.replace(/\/+$/, '');
        match.url = match.url || '/';
        match.query = isPlainObject_1.default(match.query)
            ? { ...stripped.query, ...match.query }
            : match.query || stripped.query;
    }
    if (isEmpty_1.default(match.query)) {
        delete match.query;
    }
    if (isEmpty_1.default(match.cookies)) {
        delete match.cookies;
    }
    const originalNormal = {
        ...match
    };
    $meta.original = originalMatch;
    $meta.originalNormal = originalNormal;
    if (typeof match.url === 'string') {
        if (!incoming) {
            const matchKeys = [];
            // `pathToRegexp` mutates `matchKeys` to contain a list of named parameters
            const regex = path_to_regexp_1.default(encodeProtocolAndPort(match.url), matchKeys);
            match.url = u => regex.test(encodeProtocolAndPort(u) || encodeProtocolAndPort(`/${u}`));
            $meta.regex = regex;
            $meta.matchKeys = matchKeys;
            $meta.fn = match.url.toString();
        }
    }
    else if (isRegExp_1.default(match.url)) {
        if (!incoming) {
            const regex = match.url;
            match.url = u => regex.test(decodeProtocolAndPort(u)) || regex.test(decodeProtocolAndPort(`/${u}`));
            $meta.regex = regex;
            $meta.fn = match.url.toString();
        }
    }
    else if (typeof match.url === 'function') {
        const fn = match.url;
        match.url = u => fn(u) || fn(`/${u}`);
    }
    match.$meta = $meta;
    return match;
};
exports.normalize = normalize;
//# sourceMappingURL=normalize.js.map