'use strict';

/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const async = require('async');
const supertest = require('supertest');
const rimraf = require('rimraf');
const MockYeahServer = require('../../server');

const PROXY_CAPTURES_DIR = path.resolve(__dirname, '../.tmp/proxy/mockyeah');

describe('Capture Record and Playback', function() {
  let proxy;
  let remote;
  let proxyReq;
  let remoteReq;

  before((done) => {
    async.parallel([
      function(cb) {
        // Instantiate proxy server for recording
        proxy = MockYeahServer({
          name: 'proxy',
          port: 0,
          capturesDir: PROXY_CAPTURES_DIR
        }, cb);
      },
      function(cb) {
        // Instantiate remote server
        remote = MockYeahServer({
          name: 'remote',
          port: 0
        }, cb);
      }
    ], () => {
      remoteReq = supertest(remote.server);
      proxyReq = supertest(proxy.server.rootUrl + '/' + remote.server.rootUrl);
      done();
    });
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

  function getCaptureFilePath(captureName, _path) {
    const fileName = _path.replace(/^\/?/, '').replace(/\//g, '|');
    return path.resolve(PROXY_CAPTURES_DIR, captureName, fileName);
  }

  it('should record and playback capture', function(done) {
    this.timeout = 10000;

    const captureName = 'some-fancy-capture';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/service/two';
    const path3 = '/some/service/three';
    const path4 = '/some/service/four';
    const path5 = '/some/service/five';

    // Determine file save locations from capture name and remote service urls
    const filePath1 = getCaptureFilePath(captureName, remote.server.rootUrl + path1);
    const filePath2 = getCaptureFilePath(captureName, remote.server.rootUrl + path2);
    const filePath3 = getCaptureFilePath(captureName, remote.server.rootUrl + path3);
    const filePath4 = getCaptureFilePath(captureName, remote.server.rootUrl + path4);
    const filePath5 = getCaptureFilePath(captureName, remote.server.rootUrl + path5);

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });
    remote.get('/some/service/two', { text: 'second' });
    remote.get('/some/service/three', { text: 'third' });
    remote.get('/some/service/four', { text: 'fourth' });
    remote.get('/some/service/five', { text: 'fifth' });

    // Initiate recording and playback series
    async.series([
      // Initiate recording
      (cb) => { proxy.record(captureName); cb(); },

      // Invoke requests to remote services through proxy
      // e.g. http://localhost:4041/http://example.com/some/service
      (cb) => proxyReq.get(path1).expect(200, 'first', cb),
      (cb) => proxyReq.get(path2).expect(200, 'second', cb),
      (cb) => proxyReq.get(path3).expect(200, 'third', cb),
      (cb) => proxyReq.get(path4).expect(200, 'fourth', cb),
      (cb) => proxyReq.get(path5).expect(200, 'fifth', cb),

      // Assert files exist
      (cb) => { fs.statSync(filePath1); cb(); },
      (cb) => { fs.statSync(filePath2); cb(); },
      (cb) => { fs.statSync(filePath3); cb(); },
      (cb) => { fs.statSync(filePath4); cb(); },
      (cb) => { fs.statSync(filePath5); cb(); },

      // Reset proxy services and play captured capture
      (cb) => { proxy.reset(); cb(); },
      (cb) => { proxy.play(captureName); cb(); },

      // Test remote url paths and their sub paths route to the same services
      // Assert remote url paths are routed the correct responses
      // e.g. http://localhost:4041/http://example.com/some/service
      (cb) => remoteReq.get(path1).expect(200, 'first', cb),
      (cb) => remoteReq.get(path2).expect(200, 'second', cb),
      (cb) => remoteReq.get(path3).expect(200, 'third', cb),
      (cb) => remoteReq.get(path4).expect(200, 'fourth', cb),
      (cb) => remoteReq.get(path5).expect(200, 'fifth', cb),

      // Assert paths are routed the correct responses
      // e.g. http://localhost:4041/some/service
      (cb) => proxyReq.get(path1).expect(200, 'first', cb),
      (cb) => proxyReq.get(path2).expect(200, 'second', cb),
      (cb) => proxyReq.get(path3).expect(200, 'third', cb),
      (cb) => proxyReq.get(path4).expect(200, 'fourth', cb),
      (cb) => proxyReq.get(path5).expect(200, 'fifth', cb)
    ], done);
  });
});
