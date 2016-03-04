'use strict';
/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const prepareConfig = require('./lib/prepareConfig');
const relativeRoot = require('./lib/relativeRoot');
let config;

try {
  config = fs.readFileSync(path.resolve(relativeRoot, '.mockyeah'));
  config = JSON.parse(config);
} catch (err) {
  // noop
}

// TODO: .mock-yeah file is deprecated. Remove this try-catch at an opportune time.
try {
  if (!config) {
    config = fs.readFileSync(path.resolve(relativeRoot, '.mock-yeah'));
    config = JSON.parse(config);
  }
} catch (err) {
  // noop
}

module.exports = prepareConfig(config);