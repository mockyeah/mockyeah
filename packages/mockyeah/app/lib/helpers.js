const _ = require('lodash');
const nodePath = require('path');
const { parse } = require('url');
const isAbsoluteUrl = require('is-absolute-url');
const pathToRegExp = require('path-to-regexp');
const {
  decodedPortRegex,
  decodedProtocolRegex,
  encodedPortRegex,
  encodedProtocolRegex
} = require('./constants');
const routeHandler = require('./routeHandler');

const isPromise = value => value instanceof Promise || !!(value.then && value.catch);

function resolveFilePath(capturePath, url) {
  const fileName = url.replace(/\//g, '|');
  return nodePath.resolve(capturePath, fileName);
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
  const { capturesDir } = app.config;
  const capturePath = nodePath.join(capturesDir, name);
  const filePath = resolveFilePath(capturePath, 'index.js');

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const captures = require(filePath);

    return captures;
  } catch (err) {
    app.log(['capture', 'error'], `No such capture ${name} found.`);
  }
};

const handleContentType = (body, headers) => {
  const contentType = headers['content-type'];

  // TODO: More spec-conformant detection of JSON content type.
  if (contentType && contentType.includes('/json')) {
    /* eslint-disable no-empty */
    try {
      const json = JSON.parse(body);
      return {
        json
      };
    } catch (err) {
      // silence any errors, invalid JSON is ok
    }
    /* eslint-enable no-empty */
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

const getDataForRecordToFixtures = ({ responseOptions, name, index }) => {
  const newResponseOptions = Object.assign({}, responseOptions);

  const { raw, json } = responseOptions;

  const fixtureName = `${name}/${index}`;

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
    // `pathToRegExp` mutates `matchKeys` to contain a list of named parameters
    const pathRegExp = pathToRegExp(paramEncodedPathname, matchKeys);

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

const compileRoute = (app, match, response) => {
  const { method } = match;

  const route = {
    method,
    response
  };

  if (!_.isFunction(route.response)) {
    route.response = routeHandler(app, route);
  }

  if (!_.isPlainObject(match)) {
    Object.assign(route, handlePathTypes(match));
  } else {
    const object = match;
    const headers = _.mapKeys(object.headers, (value, key) => key.toLowerCase());

    Object.assign(
      route,
      handlePathTypes(typeof object.path !== 'undefined' ? object.path : object.url, object.query),
      {
        body: object.body,
        headers
      }
    );
  }

  return route;
};

module.exports = {
  isPromise,
  compileRoute,
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
