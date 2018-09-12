'use strict';

const { expect } = require('chai');

const { MOCKYEAH_ROOT } = process.env;
process.env.MOCKYEAH_ROOT = '/fake/root';

const prepareConfig = require('../../lib/prepareConfig');

describe('prepareConfig', () => {
  after(() => {
    process.env.MOCKYEAH_ROOT = MOCKYEAH_ROOT;
  });

  it('should work and use defaults with no config input', () => {
    const config = prepareConfig();
    expect(config).to.deep.equal({
      adminHost: 'localhost',
      adminPort: 4777,
      adminProtocol: 'http',
      adminServer: true,
      capturesDir: '/fake/root/mockyeah',
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
      verbose: false
    });
  });
  it('should work and use defaults with empty config input', () => {
    const config = prepareConfig({});
    expect(config).to.deep.equal({
      adminHost: 'localhost',
      adminPort: 4777,
      adminProtocol: 'http',
      adminServer: true,
      capturesDir: '/fake/root/mockyeah',
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
      verbose: false
    });
  });
});
