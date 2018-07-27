const path = require('path');

function resolveFilePath(capturePath, url) {
  const fileName = url.replace(/\//g, '|');
  return path.resolve(capturePath, fileName);
}

exports.resolveFilePath = resolveFilePath;
