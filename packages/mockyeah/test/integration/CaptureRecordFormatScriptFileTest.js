'use strict';

/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const async = require('async');
const supertest = require('supertest');
const rimraf = require('rimraf');
const MockYeahServer = require('../../server');
const { expect } = require('chai');

const PROXY_CAPTURES_DIR = path.resolve(__dirname, '../.tmp/proxy/mockyeah');

describe('Capture Record Format Script File Test', function() {
  let proxy;
  let remote;
  let proxyReq;
  let remoteReq;

  before(done => {
    async.parallel(
      [
        function(cb) {
          // Instantiate proxy server for recording
          proxy = MockYeahServer(
            {
              name: 'proxy',
              port: 0,
              adminPort: 0,
              capturesDir: PROXY_CAPTURES_DIR,
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
        proxyReq = supertest(`${proxy.server.rootUrl}/${remote.server.rootUrl}`);
        done();
      }
    );
  });

  afterEach(() => {
    proxy.reset();
    remote.reset();
    rimraf.sync(PROXY_CAPTURES_DIR);
  });

  after(() => {
    proxy.close();
    remote.close();
  });

  function getCaptureFilePath(captureName) {
    return path.resolve(PROXY_CAPTURES_DIR, captureName, 'index.js');
  }

  it('should record and format script', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-format-script-file';

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
          proxy.record(captureName);
          cb();
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, cb),

        // Stop recording
        cb => {
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          const contents = fs.readFileSync(getCaptureFilePath(captureName), 'utf8');
          expect(contents).to.match(
            // eslint-disable-next-line no-regex-spaces
            /module\.exports = \[   \[     ".*\/some\/service\/one",     {       "status": 200,       "raw": ""     }   \] ];/
          );
          cb();
        },

        // Reset proxy services and play captured capture
        cb => {
          proxy.reset();
          cb();
        },

        cb => {
          proxy.play(captureName);
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
});
