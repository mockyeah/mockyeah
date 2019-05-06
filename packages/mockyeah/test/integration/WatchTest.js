'use strict';

const fs = require('fs-extra');
const chokidar = require('chokidar');
const async = require('async');
require('../TestHelper');
const MockYeahServer = require('../../server');
const supertest = require('supertest');

const watchedSuiteDir = `${__dirname}/../mockyeah/test-some-custom-watcher-suite`;
const watchedSuiteFile = `${watchedSuiteDir}/index.js`;

const root = `${__dirname}/../`;

const chokidarWatch = chokidar.watch;

describe('Watcher Test', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-sync
    fs.removeSync(watchedSuiteDir);
  });

  afterEach(() => {
    // eslint-disable-next-line no-sync
    fs.removeSync(watchedSuiteDir);
    chokidar.watch = chokidarWatch;
  });

  it('should watch programmatically with callback', function(done) {
    this.timeout(10000);

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0, root, watch: false });

    mockyeah.playAll();
    mockyeah.watch(err => {
      if (err) {
        done(err);
        return;
      }

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
              mockyeah.close(shutErr => done(err || shutErr));
            });
        }, 1000);
      }, 1000);
    });
  });

  it('should watch programmatically with promise', function(done) {
    this.timeout(10000);

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0, root, watch: false });

    mockyeah.playAll();

    mockyeah
      .watch()
      .then(() => {
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
                mockyeah.close(shutErr => done(err || shutErr));
              });
          }, 1000);
        }, 1000);
      })
      .catch(done);
  });

  it('should watch programmatically with error', function(done) {
    this.timeout(10000);

    chokidar.watch = () => ({
      on(event, callback) {
        if (event === 'error') callback(new Error('fake error'));
      }
    });

    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0, root, watch: false });

    const cbs = [];
    async.times(2, (__, cb) => cbs.push(cb), done);

    mockyeah
      .watch(err => {
        if (err && err.message === 'fake error') {
          if (err.message === 'fake error') cbs[0]();
          else cbs[0](new Error('expected fake error'));
          return;
        }

        cbs[0](new Error('expected error'));
      })
      .then(() => {
        cbs[1](new Error('expected error'));
      })
      .catch(err => {
        if (err.message === 'fake error') cbs[1]();
        else cbs[1](new Error('expected fake error'));
      });
  });

  it('should watch based on config', function(done) {
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
            mockyeah.close(shutErr => done(err || shutErr));
          });
      }, 1000);
    }, 1000);
  });

  it('should not watch based on config', function(done) {
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
            mockyeah.close(shutErr => done(err || shutErr));
          });
      }, 1000);
    }, 1000);
  });
});
