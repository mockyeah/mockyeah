'use strict';

/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const async = require('async');
const supertest = require('supertest');
const rimraf = require('rimraf');
const { expect } = require('chai');
const MockYeahServer = require('../../server');

const PROXY_SUITES_DIR = path.resolve(__dirname, '../.tmp/proxy/mockyeah');

describe('Record Format Script File Test', function() {
  let proxy;
  let remote;
  let proxyReq;
  let remoteReq;

  before(done => {
    this.timeout(5000);
    async.parallel(
      [
        function(cb) {
          // Instantiate proxy server for recording
          proxy = MockYeahServer(
            {
              name: 'proxy',
              port: 0,
              adminPort: 0,
              suitesDir: PROXY_SUITES_DIR,
              formatScript: path.resolve(__dirname, '../formatter.js')
            },
            cb
          );
        },
        function(cb) {
          // Instantiate remote server
          remote = MockYeahServer(
            {
              name: 'remote',
              port: 0,
              adminPort: 0
            },
            cb
          );
        }
      ],
      () => {
        remoteReq = supertest(remote.server);
        proxyReq = supertest(`${proxy.server.url}/${remote.server.url}`);
        done();
      }
    );
  });

  afterEach(() => {
    proxy.reset();
    remote.reset();
    rimraf.sync(PROXY_SUITES_DIR);
  });

  after(() => Promise.all([proxy.close(), remote.close()]));

  function getSuiteFilePath(suiteName) {
    return path.resolve(PROXY_SUITES_DIR, suiteName, 'index.js');
  }

  it('should record and format script', function(done) {
    this.timeout(10000);

    const suiteName = 'test-some-fancy-suite-format-script-file';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';

    // Mount remote service end points
    remote.get('/some/service/one', {});

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxy.record(suiteName);
          cb();
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, cb),

        // Stop recording
        cb => {
          proxy.recordStop(cb);
        },

        // Assert suite file exists
        cb => {
          const contents = fs.readFileSync(getSuiteFilePath(suiteName), 'utf8');
          expect(contents).to.match(
            // eslint-disable-next-line no-regex-spaces
            /module\.exports = \[   \[\s+".*\/some\/service\/one"\s+\] ];/
          );
          cb();
        },

        // Reset proxy services and play recorded suite
        cb => {
          proxy.reset();
          cb();
        },

        cb => {
          proxy.play(suiteName);
          cb();
        },

        // Test remote url paths and their sub paths route to the same services
        // Assert remote url paths are routed the correct responses
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => remoteReq.get(path1).expect(200, cb),

        // Assert paths are routed the correct responses
        cb => proxyReq.get(path1).expect(200, cb)
      ],
      done
    );
  });

  it('should record non-200 status and format script', function(done) {
    this.timeout(10000);

    const suiteName = 'test-some-fancy-suite-non-200-format-script-file';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';

    // Mount remote service end points
    remote.get('/some/service/one', { status: 206 });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxy.record(suiteName);
          cb();
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(206, cb),

        // Stop recording
        cb => {
          proxy.recordStop(cb);
        },

        // Assert suite file exists
        cb => {
          const contents = fs.readFileSync(getSuiteFilePath(suiteName), 'utf8');
          expect(contents).to.match(
            // eslint-disable-next-line no-regex-spaces
            /module\.exports = \[   \[     ".*\/some\/service\/one",     {\s+"status": 206\s+}   \] ];/
          );
          cb();
        },

        // Reset proxy services and play recorded suite
        cb => {
          proxy.reset();
          cb();
        },

        cb => {
          proxy.play(suiteName);
          cb();
        },

        // Test remote url paths and their sub paths route to the same services
        // Assert remote url paths are routed the correct responses
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => remoteReq.get(path1).expect(206, cb),

        // Assert paths are routed the correct responses
        cb => proxyReq.get(path1).expect(206, cb)
      ],
      done
    );
  });
});
