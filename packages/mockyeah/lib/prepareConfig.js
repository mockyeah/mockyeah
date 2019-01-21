'use strict';

const expandPath = require('./expandPath');

const configDefaults = {
  name: 'mockyeah',
  host: 'localhost',
  port: 4001,
  fixturesDir: './fixtures',
  capturesDir: './mockyeah',
  output: true,
  journal: false,
  verbose: false,
  proxy: false,
  record: false,
  adminServer: true,
  // TODO: Implement support for HTTPS admin server protocol.
  adminProtocol: 'http',
  adminHost: 'localhost',
  adminPort: 4777,
  recordToFixtures: true,
  recordToFixturesMode: 'path',
  formatScript: undefined,
  watch: false
};

module.exports = (config = {}) => {
  config.adminHost = config.adminHost || config.host || configDefaults.host;
  config.proxy = (config.proxy || config.record) === true;

  config = Object.assign({}, configDefaults, config);

  // Expand file system configuration paths relative to configuration root
  config.fixturesDir = expandPath(config.fixturesDir);
  config.capturesDir = expandPath(config.capturesDir);
  config.httpsKeyPath = config.httpsKeyPath && expandPath(config.httpsKeyPath);
  config.httpsCertPath = config.httpsCertPath && expandPath(config.httpsCertPath);

  return config;
};
