'use strict';

/* eslint-disable no-sync */

const fs = require('fs');
const path = require('path');
const async = require('async');
const supertest = require('supertest');
const rimraf = require('rimraf');
const MockYeahServer = require('../../server');

const PROXY_SUITES_DIR = path.resolve(__dirname, '../.tmp/proxy/mockyeah');

describe('Record and Playback Admin Server', function() {
  let proxy;
  let remote;
  let proxyReq;
  let proxyAdminReq;
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
              suitesDir: PROXY_SUITES_DIR,
              proxy: false
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
        proxyAdminReq = supertest(`${proxy.adminServer.url}`);
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

  it('should record and playback suite over admin server', function(done) {
    this.timeout(10000);

    const suiteName = 'test-some-fancy-admin-server-suite';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/service/two';
    const path3 = '/some/service/three';
    const path4 = '/some/service/four';
    const path5 = '/some/service/five';

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });
    remote.get('/some/service/two', { text: 'second' });
    remote.get('/some/service/three', { text: 'third' });
    remote.get('/some/service/four', { text: 'fourth' });
    remote.get('/some/service/five', { text: 'fifth' });

    // Initiate recording and playback series
    async.series(
      [
        // Fail to initiate recording without name
        cb => {
          proxyAdminReq.get(`/record`).expect(400, cb);
        },

        // Initiate recording
        cb => {
          proxyAdminReq.get(`/record?name=${suiteName}`).expect(204, cb);
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, 'second', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb),
        cb => proxyReq.get(path5).expect(200, 'fifth', cb),

        // Stop recording
        cb => {
          proxyAdminReq.get('/record-stop').expect(204, cb);
        },

        // Assert suite file exists
        cb => {
          fs.statSync(getSuiteFilePath(suiteName));
          cb();
        },

        // Reset proxy services and play recorded suite
        cb => {
          proxy.reset();
          cb();
        },

        // Fail to initiate playing without name
        cb => {
          proxyAdminReq.get(`/play`).expect(400, cb);
        },

        cb => {
          proxyAdminReq.get(`/play?name=${suiteName}`).expect(204, cb);
        },

        // Test remote url paths and their sub paths route to the same services
        // Assert remote url paths are routed the correct responses
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => remoteReq.get(path1).expect(200, 'first', cb),
        cb => remoteReq.get(path2).expect(200, 'second', cb),
        cb => remoteReq.get(path3).expect(200, 'third', cb),
        cb => remoteReq.get(path4).expect(200, 'fourth', cb),
        cb => remoteReq.get(path5).expect(200, 'fifth', cb),

        // Assert paths are routed the correct responses
        // e.g. http://localhost:4041/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, 'second', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb),
        cb => proxyReq.get(path5).expect(200, 'fifth', cb)
      ],
      done
    );
  });

  it('should record and playback calls matching `headers` option over admin server', function(done) {
    this.timeout(10000);

    const suiteName = 'test-some-fancy-admin-server-suite-3';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxyAdminReq
            .get(
              `/record?name=${suiteName}&options=${encodeURIComponent(
                JSON.stringify({
                  headers: {
                    'X-My-Header': 'My-Value',
                    'X-My-Header-2': 'My-Value-2'
                  }
                })
              )}`
            )
            .expect(204, cb);
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),

        // Stop recording but pretend there's a file write error.
        cb => {
          const { writeFile } = fs;
          fs.writeFile = (filePath, js, _cb) => _cb(new Error('fake fs error'));
          proxy.recordStop(err => {
            fs.writeFile = writeFile;
            if (err) {
              cb();
              return;
            }
            cb(new Error('expected error'));
          });
        },

        // Stop recording
        cb => {
          proxyAdminReq.get('/record-stop').expect(204, cb);
        },

        // Assert suite file exists
        cb => {
          fs.statSync(getSuiteFilePath(suiteName));
          cb();
        },

        // Reset proxy services and play recorded suite
        cb => {
          proxy.reset();
          cb();
        },

        cb => {
          proxyAdminReq.get(`/play?name=${suiteName}`).expect(204, cb);
        },

        // Test remote url paths and their sub paths route to the same services
        // Assert remote url paths are routed the correct responses
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => remoteReq.get(path1).expect(200, 'first', cb),

        // Assert paths are routed the correct responses
        // e.g. http://localhost:4041/some/service
        cb => proxyReq.get(path1).expect(404, cb),
        cb =>
          proxyReq
            .get(path1)
            .set('X-My-Header', 'My-Value')
            .set('X-My-Header-2', 'My-Value-2')
            .expect(200, cb)
      ],
      done
    );
  });

  it('should record and playback suite with playAll over admin server', function(done) {
    this.timeout(10000);

    const suiteName = 'test-some-fancy-admin-server-suite-all';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/service/two';
    const path3 = '/some/service/three';
    const path4 = '/some/service/four';
    const path5 = '/some/service/five';

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });
    remote.get('/some/service/two', { text: 'second' });
    remote.get('/some/service/three', { text: 'third' });
    remote.get('/some/service/four', { text: 'fourth' });
    remote.get('/some/service/five', { text: 'fifth' });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxyAdminReq.get(`/record?name=${suiteName}`).expect(204, cb);
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, 'second', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb),
        cb => proxyReq.get(path5).expect(200, 'fifth', cb),

        // Stop recording
        cb => {
          proxyAdminReq.get('/record-stop').expect(204, cb);
        },

        // Assert suite file exists
        cb => {
          fs.statSync(getSuiteFilePath(suiteName));
          cb();
        },

        // Reset proxy services and play recorded suite
        cb => {
          proxy.reset();
          cb();
        },

        cb => {
          proxyAdminReq.get(`/playAll`).expect(204, cb);
        },

        // Test remote url paths and their sub paths route to the same services
        // Assert remote url paths are routed the correct responses
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => remoteReq.get(path1).expect(200, 'first', cb),
        cb => remoteReq.get(path2).expect(200, 'second', cb),
        cb => remoteReq.get(path3).expect(200, 'third', cb),
        cb => remoteReq.get(path4).expect(200, 'fourth', cb),
        cb => remoteReq.get(path5).expect(200, 'fifth', cb),

        // Assert paths are routed the correct responses
        // e.g. http://localhost:4041/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, 'second', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb),
        cb => proxyReq.get(path5).expect(200, 'fifth', cb)
      ],
      done
    );
  });

  it('record stop should support no write', function(done) {
    this.timeout(10000);

    const suiteName = 'test-some-fancy-admin-server-suite-record-stop-no-write';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxyAdminReq.get(`/record?name=${suiteName}`).expect(204, cb);
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),

        // Stop recording
        cb => {
          proxyAdminReq.get('/record-stop?options={"noWrite":true}').expect(204, cb);
        },

        // Assert suite file does not exists
        cb => {
          try {
            fs.statSync(getSuiteFilePath(suiteName));
            cb(new Error('should fail'));
          } catch (error) {
            cb();
          }
        }
      ],
      done
    );
  });

  it('should fail when calling record stop when not recording', function(done) {
    this.timeout(10000);

    // Initiate recording and playback series
    async.series(
      [
        cb => {
          proxyAdminReq.get(`/record-stop`).expect(500, cb);
        }
      ],
      done
    );
  });
});
