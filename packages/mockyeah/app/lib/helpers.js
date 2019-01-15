const path = require('path');

const {
  decodedPortRegex,
  decodedProtocolRegex,
  encodedPortRegex,
  encodedProtocolRegex
} = require('./constants');

function resolveFilePath(capturePath, url) {
  const fileName = url.replace(/\//g, '|');
  return path.resolve(capturePath, fileName);
}

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

exports.decodeProtocolAndPort = decodeProtocolAndPort;
exports.encodeProtocolAndPort = encodeProtocolAndPort;
exports.getDataForRecordToFixtures = getDataForRecordToFixtures;
exports.replaceFixtureWithRequireInJson = replaceFixtureWithRequireInJson;
exports.handleContentType = handleContentType;
exports.resolveFilePath = resolveFilePath;
