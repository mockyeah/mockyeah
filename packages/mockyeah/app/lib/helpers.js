const nodePath = require('path');
const { parse } = require('url');
const isAbsoluteUrl = require('is-absolute-url');
const pathToRegexp = require('path-to-regexp');
const JSONparseSafe = require('json-parse-safe');
const {
  decodedPortRegex,
  decodedProtocolRegex,
  encodedPortRegex,
  encodedProtocolRegex
} = require('./constants');
const safeFilename = require('../../lib/safeFilename');

const isPromise = value => value && (value instanceof Promise || !!(value.then && value.catch));

function resolveFilePath(suitePath, url) {
  const fileName = url.replace(/\//g, '|');
  return nodePath.resolve(suitePath, fileName);
}

const relativizePath = path => (isAbsoluteUrl(path) ? `/${path}` : path);

const justSlashes = /^\/+$/;
const trailingSlashes = /\/+$/;

const normalizePathname = pathname => {
  if (!pathname || justSlashes.test(pathname)) return '/';
  // remove any trailing slashes
  return pathname.replace(trailingSlashes, '');
};

// eslint-disable-next-line consistent-return
const requireSuite = (app, name) => {
  const { suitesDir } = app.config;
  const suitePath = nodePath.join(suitesDir, name);
  const filePath = resolveFilePath(suitePath, 'index.js');

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const suites = require(filePath);

    return suites;
  } catch (err) {
    app.log(['suite', 'error'], `Error reading suite: ${err.message}`);
  }
};

const handleContentType = (body, headers) => {
  let contentType = headers['content-type'];
  contentType = Array.isArray(contentType) ? contentType[0] : contentType;

  // TODO: More spec-conformant detection of JSON content type.
  if (contentType && contentType.includes('/json')) {
    return {
      json: JSONparseSafe(body).value
    };
  }

  return {
    raw: body
  };
};

const replaceFixtureWithRequireInJson = (json, { relativePath }) =>
  json.replace(
    /"fixture"(\s*):(\s*)"([^"]+)\.json"/g,
    `"json"$1:$2require("${relativePath}/$3.json")`
  );

const getDataForRecordToFixtures = ({ responseOptions, name, index, group }) => {
  const newResponseOptions = Object.assign({}, responseOptions);

  const { raw, json } = responseOptions;

  const fixtureName = safeFilename(
    `${group && group.directory ? `${group.directory}/` : ''}${name}/${index}`
  );

  let body;

  if (raw) {
    newResponseOptions.fixture = `${fixtureName}.txt`;
    body = raw;
    delete newResponseOptions.raw;
  } else if (json) {
    newResponseOptions.fixture = `${fixtureName}.json`;
    body = JSON.stringify(json, null, 2);
    delete newResponseOptions.json;
  }

  return {
    newResponseOptions,
    body
  };
};

// Restore any special protocol or port characters that were possibly tilde-replaced.
const decodeProtocolAndPort = str =>
  str.replace(encodedProtocolRegex, '$1://').replace(encodedPortRegex, '$1:');

const encodeProtocolAndPort = str =>
  str.replace(decodedPortRegex, '$1~').replace(decodedProtocolRegex, '$1~~~');

const handlePathTypes = (_path, _query) => {
  if (typeof _path === 'string') {
    const path = relativizePath(_path);
    const url = parse(path, true);
    const pathname = normalizePathname(url.pathname);

    // Encode absolute URL protocol and port characters to tildes to prevent colons from being interpreted as Express parameters.
    const paramEncodedPathname = encodeProtocolAndPort(pathname);

    const matchKeys = [];
    // `pathToRegexp` mutates `matchKeys` to contain a list of named parameters
    const pathRegExp = pathToRegexp(paramEncodedPathname, matchKeys);

    const query = Object.assign({}, url.query, _query);

    return {
      matchKeys,
      path,
      pathFn: p => pathRegExp.test(encodeProtocolAndPort(p)),
      pathname,
      pathRegExp,
      query
    };
  }

  if (_path instanceof RegExp) {
    // TODO: Maybe support `matchKeys` with index of match or maybe even named capture groups?

    return {
      path: _path,
      pathFn: p => _path.test(decodeProtocolAndPort(p)),
      pathname: _path
    };
  }

  if (typeof _path === 'function') {
    return {
      path: _path,
      pathFn: p => _path(decodeProtocolAndPort(p)),
      pathname: _path
    };
  }

  throw new Error(`Unsupported path type ${typeof _path}: ${_path}`);
};

module.exports = {
  isPromise,
  requireSuite,
  decodeProtocolAndPort,
  encodeProtocolAndPort,
  getDataForRecordToFixtures,
  normalizePathname,
  replaceFixtureWithRequireInJson,
  handleContentType,
  handlePathTypes,
  resolveFilePath
};
