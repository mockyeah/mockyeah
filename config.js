'use strict';
/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');

/**
 * Determine wrapping application root
 *  Needed for searching for .mock-yeah configuration file.
 */
const root = path.resolve(__dirname, global.MOCK_YEAH_ROOT ? global.MOCK_YEAH_ROOT : '../..');

const configDefaults = {
  port: 4001,
  fixturesDir: './fixtures'
};

let config = {};

try {
  config = fs.readFileSync(path.resolve(root, '.mock-yeah'));
  config = JSON.parse(config);
} catch (err) {
  // noop
}

module.exports = Object.assign(configDefaults, config);