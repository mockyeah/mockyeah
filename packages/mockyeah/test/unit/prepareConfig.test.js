'use strict';

const clearRequire = require('clear-require');
const { expect } = require('chai');

describe('prepareConfig', () => {
  let MOCKYEAH_ROOT_BACKUP;
  let prepareConfig;

  before(() => {
    clearRequire.all();
    MOCKYEAH_ROOT_BACKUP = process.env.MOCKYEAH_ROOT;
    process.env.MOCKYEAH_ROOT = '/fake/root';
    // eslint-disable-next-line global-require
    prepareConfig = require('../../lib/prepareConfig');
  });

  after(() => {
    process.env.MOCKYEAH_ROOT = MOCKYEAH_ROOT_BACKUP;
    clearRequire.all();
  });

  it('should work and use defaults with no config input', () => {
    const config = prepareConfig();
    expect(config).to.deep.equal({
      adminHost: 'localhost',
      adminPort: 4777,
      adminProtocol: 'http',
      adminServer: true,
      suitesDir: '/fake/root/mockyeah',
      fixturesDir: '/fake/root/fixtures',
      host: 'localhost',
      httpsCertPath: undefined,
      httpsKeyPath: undefined,
      journal: false,
      name: 'mockyeah',
      output: true,
      port: 4001,
      proxy: false,
      record: false,
      verbose: false,
      recordToFixtures: true,
      recordToFixturesMode: 'path',
      formatScript: undefined,
      watch: false,
      responseHeaders: true,
      groups: {},
      suiteHeader: 'x-mockyeah-suite',
      suiteCookie: 'mockyeahSuite'
    });
  });

  it('should work and use defaults with empty config input', () => {
    const config = prepareConfig({});
    expect(config).to.deep.equal({
      adminHost: 'localhost',
      adminPort: 4777,
      adminProtocol: 'http',
      adminServer: true,
      suitesDir: '/fake/root/mockyeah',
      fixturesDir: '/fake/root/fixtures',
      host: 'localhost',
      httpsCertPath: undefined,
      httpsKeyPath: undefined,
      journal: false,
      name: 'mockyeah',
      output: true,
      port: 4001,
      proxy: false,
      record: false,
      verbose: false,
      recordToFixtures: true,
      recordToFixturesMode: 'path',
      formatScript: undefined,
      watch: false,
      responseHeaders: true,
      groups: {},
      suiteHeader: 'x-mockyeah-suite',
      suiteCookie: 'mockyeahSuite'
    });
  });
});
