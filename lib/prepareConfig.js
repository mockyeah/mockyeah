'use strict';

const path = require('path');
const relativeRoot = require('./relativeRoot');

const configDefaults = {
  name: 'mockyeah',
  host: 'localhost',
  port: 4001,
  fixturesDir: './mockyeah/fixtures'
};

module.exports = (config) => {
  config = Object.assign({}, configDefaults, config || {});

  // Expand file system configuration paths relative to configuration root
  config.fixturesDir = path.resolve(relativeRoot, config.fixturesDir);

  return config;
};