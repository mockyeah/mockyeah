'use strict';

const path = require('path');
const relativeRoot = require('./relativeRoot');

module.exports = function expandPath(_path, root = relativeRoot) {
  return path.isAbsolute(_path) ? _path : path.resolve(root, _path);
};
