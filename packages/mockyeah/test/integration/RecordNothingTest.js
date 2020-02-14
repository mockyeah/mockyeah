'use strict';

/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const async = require('async');
const supertest = require('supertest');
const rimraf = require('rimraf');
const { expect } = require('chai');
const MockYeahServer = require('../../server');

const ROOT = path.resolve(__dirname, '../.tmp/proxy');

describe('Record Nothing Test', function() {
  let proxy;
  let proxyReq;

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
              root: ROOT,
              groups: {
                someService: {
                  pattern: 'some/service',
                  directory: true
                },
                someServiceNamedDir: {
                  pattern: 'some/named-dir/service',
                  directory: 'someServiceDirectoryForNamedDir'
                },
                someNonSubdirGroup: 'some/non-subdir/service',
                unusedGroup: 'unused'
              }
            },
            cb
          );
        }
      ],
      () => {
        proxyReq = supertest(`${proxy.server.url}/whatever`);
        done();
      }
    );
  });

  afterEach(() => {
    rimraf.sync(ROOT);
  });

  after(() => proxy.close());

  function getSuiteFilePath(suiteName) {
    return path.resolve(ROOT, 'mockyeah', suiteName, 'index.js');
  }

  it('should not record files when no matches', function(done) {
    this.timeout(10000);

    const suiteName = 'test-some-fancy-suite-group-file';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/non-subdir/service/two';
    const path3 = '/some/named-dir/service/three';

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxy.record(suiteName, {
            only: 'whatever/none/of/them'
          });
          cb();
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(404, cb),
        cb => proxyReq.get(path2).expect(404, cb),
        cb => proxyReq.get(path3).expect(404, cb),

        // Stop recording
        cb => {
          proxy.recordStop(cb);
        },

        // // Assert no fixture file exists
        cb => {
          expect(fs.existsSync(getSuiteFilePath(suiteName))).to.be.false;
          cb();
        }
      ],
      done
    );
  });
});
