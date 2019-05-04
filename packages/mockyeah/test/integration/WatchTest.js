'use strict';

const fs = require('fs-extra');
require('../TestHelper');
const MockYeahServer = require('../../server');
const supertest = require('supertest');

const watchedSuiteDir = `${__dirname}/../mockyeah/test-some-custom-watcher-suite`;
const watchedSuiteFile = `${watchedSuiteDir}/index.js`;

const root = `${__dirname}/../`;

describe('Watcher Test', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-sync
    fs.removeSync(watchedSuiteDir);
  });

  afterEach(() => {
    // eslint-disable-next-line no-sync
    fs.removeSync(watchedSuiteDir);
  });

  it('should watch programmatically', function (done) {
    this.timeout(10000);

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0, root, watch: false });

    mockyeah.playAll();
    mockyeah.watch();

    setTimeout(() => {
      // eslint-disable-next-line no-sync
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
            mockyeah.shutdown();
            return err ? done(err) : done();
          });
      }, 1000);
    }, 1000);
  });

  it('should watch based on config', function (done) {
    this.timeout(10000);

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0, root, watch: true });

    mockyeah.playAll();

    setTimeout(() => {
      // eslint-disable-next-line no-sync
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
            mockyeah.shutdown();
            return err ? done(err) : done();
          });
      }, 1000);
    }, 1000);
  });

  it('should not watch based on config', function (done) {
    this.timeout(10000);

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0, root, watch: false });

    mockyeah.playAll();

    setTimeout(() => {
      // eslint-disable-next-line no-sync
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
          .expect(404, err => {
            mockyeah.shutdown();
            return err ? done(err) : done();
          });
      }, 1000);
    }, 1000);
  });
});
