'use strict';

const fs = require('fs-extra');
require('../TestHelper');
const MockYeahServer = require('../../server');
const supertest = require('supertest');

const watchedSuiteDir = `${__dirname}/../mockyeah/test-some-custom-capture`;
const watchedSuiteFile = `${watchedSuiteDir}/index.js`;

describe('Watcher Test', () => {
  beforeEach(() => {
    fs.removeSync(watchedSuiteDir);
  });

  afterEach(() => {
    fs.removeSync(watchedSuiteDir);
  });

  it('should watch programmatically', function(done) {
    this.timeout(10000);

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0 });

    mockyeah.playAll();
    mockyeah.watch();

    setTimeout(() => {
      fs.outputFileSync(
        watchedSuiteFile,
        `
      module.exports = [
        [
          {
            method: 'get',
            path: '/watched'
          },
          {
            text: 'watched!'
          }
        ]
      ];
      `
      );

      setTimeout(() => {
        supertest(mockyeah.server)
          .get('/watched')
          .expect(200, 'watched!', err => {
            mockyeah.close();
            return err ? done(err) : done();
          });
      }, 1000);
    }, 1000);
  });

  it('should watch based on config', function(done) {
    this.timeout(10000);

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0, watch: true });

    mockyeah.playAll();

    setTimeout(() => {
      fs.outputFileSync(
        watchedSuiteFile,
        `
      module.exports = [
        [
          {
            method: 'get',
            path: '/watched'
          },
          {
            text: 'watched!'
          }
        ]
      ];
      `
      );

      setTimeout(() => {
        supertest(mockyeah.server)
          .get('/watched')
          .expect(200, 'watched!', err => {
            mockyeah.close();
            return err ? done(err) : done();
          });
      }, 1000);
    }, 1000);
  });
});
