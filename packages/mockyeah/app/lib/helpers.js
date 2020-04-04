const nodePath = require('path');
const JSONparseSafe = require('json-parse-safe');
const { isPlainObject } = require('lodash');
const {
  decodedPortRegex,
  decodedProtocolRegex,
  encodedPortRegex,
  encodedProtocolRegex
} = require('./constants');

const safeFilename = require('../../lib/safeFilename');

function resolveFilePath(suitePath, url) {
  const fileName = url.replace(/\//g, '|');
  return nodePath.resolve(suitePath, fileName);
}

// eslint-disable-next-line consistent-return
const requireSuite = (app, name) => {
  const { suitesDir } = app.config;
  const suitePath = nodePath.join(suitesDir, name);
  const filePath = resolveFilePath(suitePath, 'index.js');

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const mocks = require(filePath);

    return mocks.map(mock => [
      mock[0],
      isPlainObject(mock[1]) ? Object.assign({ name }, mock[1]) : mock[1]
    ]);
  } catch (err) {
    app.log(['suite', 'error'], `Error reading suite: ${err.message}`);
  }
};

const handleContentType = (body, headers) => {
  if (!body) return {};

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

module.exports = {
  requireSuite,
  decodeProtocolAndPort,
  encodeProtocolAndPort,
  getDataForRecordToFixtures,
  replaceFixtureWithRequireInJson,
  handleContentType,
  resolveFilePath
};
