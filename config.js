'use strict';
/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const prepareConfig = require('./lib/prepareConfig');
const relativeRoot = require('./lib/relativeRoot');
let config;

try {
  config = fs.readFileSync(path.resolve(relativeRoot, '.mockyeah'));
} catch (err) {
  // noop
}

// TODO: .mock-yeah file is deprecated. Remove this try-catch at an opportune time.
try {
  if (!config) {
    config = fs.readFileSync(path.resolve(relativeRoot, '.mock-yeah'));
  }
} catch (err) {
  // noop
}

try {
  if (config) config = JSON.parse(config);
} catch (err) {
  throw new Error('Invalid JSON in .mockyeah configuration file');
}

module.exports = prepareConfig(config);