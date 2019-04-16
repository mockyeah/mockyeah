'use strict';

const expandPath = require('./expandPath');

const configDefaults = {
  name: 'mockyeah',
  host: 'localhost',
  port: 4001,
  fixturesDir: './fixtures',
  suitesDir: './mockyeah',
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
  watch: false,
  responseHeaders: true,
  groups: {},
  suiteHeader: 'x-mockyeah-suite',
  suiteCookie: 'mockyeahSuite'
};

module.exports = (config = {}) => {
  config.adminHost = config.adminHost || config.host || configDefaults.host;
  config.proxy = (config.proxy || config.record) === true;

  // legacy support for `capturesDir`
  config.suitesDir = config.suitesDir || config.capturesDir || configDefaults.suitesDir;

  config = Object.assign({}, configDefaults, config);

  // Expand file system configuration paths relative to configuration root
  config.fixturesDir = expandPath(config.fixturesDir, config.root);
  config.suitesDir = expandPath(config.suitesDir, config.root);
  config.httpsKeyPath = config.httpsKeyPath && expandPath(config.httpsKeyPath, config.root);
  config.httpsCertPath = config.httpsCertPath && expandPath(config.httpsCertPath, config.root);

  return config;
};
