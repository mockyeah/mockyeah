const path = require('path');

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

exports.handleContentType = handleContentType;
exports.resolveFilePath = resolveFilePath;
