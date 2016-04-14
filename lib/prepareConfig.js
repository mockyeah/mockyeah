'use strict';

const expandPath = require('./expandPath');

const configDefaults = {
  name: 'mockyeah',
  host: 'localhost',
  port: 4001,
  fixturesDir: './fixtures',
  capturesDir: './mockyeah'
};

module.exports = (config) => {
  config = Object.assign({}, configDefaults, config || {});

  // Expand file system configuration paths relative to configuration root
  config.fixturesDir = expandPath(config.fixturesDir);
  config.capturesDir = expandPath(config.capturesDir);

  return config;
};