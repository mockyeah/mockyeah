'use strict';

const path = require('path');

module.exports = env => {
  global.MOCKYEAH_ROOT = env.cwd;
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(env.modulePath
    ? path.resolve(env.modulePath, '../config')
    : '@mockyeah/server/config');
};
