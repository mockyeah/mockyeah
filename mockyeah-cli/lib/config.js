'use strict';

const path = require('path');

module.exports = (env) => {
  global.MOCKYEAH_ROOT = env.cwd;
  return require(path.resolve(env.modulePath, '../config'));
};