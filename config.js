'use strict';
/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
let config;

/**
 * Determine wrapping application root
 *  Needed for searching for .mockyeah configuration file.
 */
const root = path.resolve(__dirname, global.MOCK_YEAH_ROOT ? global.MOCK_YEAH_ROOT : '../..');

const configDefaults = {
  port: 4001,
  setsDir: './mockyeah/sets',
  fixturesDir: './mockyeah/fixtures'
};

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

module.exports = Object.assign(configDefaults, config || {});