'use strict';

/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const async = require('async');
const supertest = require('supertest');
const rimraf = require('rimraf');
const MockYeahServer = require('../../server');
const { expect } = require('chai');

const ROOT = path.resolve(__dirname, '../.tmp/proxy');

describe('Record Groups Test', function() {
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
    rimraf.sync(ROOT);
  });

  after(() => {
    proxy.close();
    remote.close();
  });

  function getSuiteFilePath(suiteName) {
    return path.resolve(ROOT, 'mockyeah', suiteName, 'index.js');
  }

  function getFixtureFilePath(suiteName, groupName = '.') {
    return path.resolve(ROOT, 'fixtures', groupName, suiteName, '0.txt');
  }

  it('should record fixture to group subdirectory', function(done) {
    this.timeout = 10000;

    const suiteName = 'test-some-fancy-suite-group-file';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/non-subdir/service/two';
    const path3 = '/some/named-dir/service/three';

    // Mount remote service end points
    remote.get(path1, { text: 'hey there' });
    remote.get(path2, { text: 'hey non-subdir there' });
    remote.get(path3, { text: 'hey named dir there' });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxy.record(suiteName, {
            groups: [
              'someService',
              'someNonSubdirGroup',
              'someServiceNamedDir',
              'unknownGroupSpecified'
            ]
          });
          cb();
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, cb),
        cb => proxyReq.get(path2).expect(200, cb),
        cb => proxyReq.get(path3).expect(200, cb),

        // Stop recording
        cb => {
          proxy.recordStop(cb);
        },

        // // Assert fixture file exists
        cb => {
          const contents = fs.readFileSync(getFixtureFilePath(suiteName, 'someService'), 'utf8');
          expect(contents).to.equal('hey there');
          cb();
        },

        // // Assert fixture file exists
        cb => {
          const contents = fs.readFileSync(getFixtureFilePath(suiteName), 'utf8');
          expect(contents).to.equal('hey non-subdir there');
          cb();
        },

        // // Assert fixture file exists
        cb => {
          const contents = fs.readFileSync(
            getFixtureFilePath(suiteName, 'someServiceDirectoryForNamedDir'),
            'utf8'
          );
          expect(contents).to.equal('hey named dir there');
          cb();
        },

        // Assert suite file exists
        cb => {
          const contents = fs.readFileSync(getSuiteFilePath(suiteName), 'utf8');
          expect(contents).to.contain(
            '"fixture": "someService/test-some-fancy-suite-group-file/0.txt"'
          );
          expect(contents).to.contain(
            '"fixture": "someServiceDirectoryForNamedDir/test-some-fancy-suite-group-file/0.txt"'
          );
          expect(contents).to.contain('"fixture": "test-some-fancy-suite-group-file/0.txt"');
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
});
