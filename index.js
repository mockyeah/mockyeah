'use strict';
/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const Server = require('./server');
let config;

/**
 * Determine wrapping application root
 *  Needed for searching for .mockyeah configuration file.
 */
const root = path.resolve(__dirname, global.MOCKYEAH_ROOT ? global.MOCKYEAH_ROOT : '../..');

try {
  config = fs.readFileSync(path.resolve(root, '.mockyeah'));
  config = JSON.parse(config);
} catch (err) {
  // noop
}

// TODO: .mock-yeah file is deprecated. Remove this try-catch at an opportune time.
try {
  if (!config) {
    config = fs.readFileSync(path.resolve(root, '.mock-yeah'));
    config = JSON.parse(config);
  }
} catch (err) {
  // noop
}

module.exports = new Server(config);