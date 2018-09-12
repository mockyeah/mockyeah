'use strict';

const { expect } = require('chai');

const prepareConfig = require('../../lib/prepareConfig');

describe('prepareConfig', () => {
  it('should work and use defaults with no config input', () => {
    const config = prepareConfig();
    expect(config).to.deep.equal({
      adminHost: 'localhost',
      adminPort: 4777,
      adminProtocol: 'http',
      adminServer: true,
      capturesDir: '/Users/anders/code/mockyeah/mockyeah',
      fixturesDir: '/Users/anders/code/mockyeah/fixtures',
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
      capturesDir: '/Users/anders/code/mockyeah/mockyeah',
      fixturesDir: '/Users/anders/code/mockyeah/fixtures',
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
