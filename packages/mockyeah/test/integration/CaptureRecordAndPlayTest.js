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
              capturesDir: PROXY_CAPTURES_DIR
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

  it('should record and playback capture', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/service/two';
    const path3 = '/some/service/three';
    const path4 = '/some/service/four';
    const path5 = '/some/service/five';

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });
    remote.get('/some/service/two', { json: { second: true } });
    remote.get('/some/service/three', { text: 'third', headers: {} });
    remote.get('/some/service/four');
    remote.post('/some/service/five', {
      text: 'fifth',
      headers: {
        'x-foo': 'bar'
      }
    });

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
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, '{"second":true}', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, cb),
        cb =>
          proxyReq
            .post(path5)
            .send({ foo: 'bar' })
            .expect(200, 'fifth', cb),

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
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          fs.statSync(getCaptureFilePath(captureName));
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
        cb => remoteReq.get(path1).expect(200, 'first', cb),
        cb => remoteReq.get(path2).expect(200, '{"second":true}', cb),
        cb => remoteReq.get(path3).expect(200, 'third', cb),
        cb => remoteReq.get(path4).expect(200, cb),
        cb =>
          remoteReq
            .post(path5)
            .send({ foo: 'bar' })
            .expect(200, 'fifth', cb),

        // Assert paths are routed the correct responses
        // e.g. http://localhost:4041/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, '{\n  "second": true\n}', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, cb),
        cb =>
          proxyReq
            .post(path5)
            .send({ foo: 'bar' })
            .expect(200, 'fifth', cb)
      ],
      done
    );
  });

  it('should record and playback calls matching `only` option', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-2';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/service/two';
    const path3 = '/some/service/three';
    const path4 = '/some/service/three/1';

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });
    remote.get('/some/service/two', { json: { second: true } });
    remote.get('/some/service/three', { text: 'third' });
    remote.get('/some/service/three/:id', { text: 'fourth' });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxy.record(captureName, { only: '.*three.*' });
          cb();
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, '{"second":true}', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb),

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
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          fs.statSync(getCaptureFilePath(captureName));
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
        cb => remoteReq.get(path1).expect(200, 'first', cb),
        cb => remoteReq.get(path2).expect(200, '{"second":true}', cb),
        cb => remoteReq.get(path3).expect(200, 'third', cb),
        cb => remoteReq.get(path4).expect(200, 'fourth', cb),

        // Assert paths are routed the correct responses
        // e.g. http://localhost:4041/some/service
        cb => proxyReq.get(path1).expect(404, cb),
        cb => proxyReq.get(path2).expect(404, cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb)
      ],
      done
    );
  });

  it('should record and playback calls matching `headers` option', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-3';

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
          proxy.record(captureName, {
            headers: {
              'X-My-Header': 'My-Value',
              'X-My-Header-2': 'My-Value-2'
            }
          });
          cb();
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
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          fs.statSync(getCaptureFilePath(captureName));
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

  it('should record and playback calls with empty `headers` option', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-3';

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
          proxy.record(captureName, {
            headers: {}
          });
          cb();
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
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          fs.statSync(getCaptureFilePath(captureName));
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
        cb => remoteReq.get(path1).expect(200, 'first', cb),

        // Assert paths are routed the correct responses
        // e.g. http://localhost:4041/some/service
        cb => proxyReq.get(path1).expect(404, cb)
      ],
      done
    );
  });

  it('should record and playback call headers with `useHeaders` option', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-using-headers';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';

    // Mount remote service end points
    remote.get('/some/service/one', {
      headers: {
        'x-my-header': 'My-Value'
      }
    });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxy.record(captureName, {
            useHeaders: true
          });
          cb();
        },

        // Invoke requests to remote services through proxy
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => proxyReq.get(path1).expect('x-my-header', 'My-Value', cb),

        // Stop recording
        cb => {
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          fs.statSync(getCaptureFilePath(captureName));
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
        cb => remoteReq.get(path1).expect('x-my-header', 'My-Value', cb),

        // Assert paths are routed the correct responses
        cb => proxyReq.get(path1).expect('x-my-header', 'My-Value', cb)
      ],
      done
    );
  });

  it('should record and playback call latency with `useLatency` option', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-using-latency';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';

    // Mount remote service end points
    remote.get('/some/service/one', {
      latency: 200
    });

    // Initiate recording and playback series
    async.series(
      [
        // Initiate recording
        cb => {
          proxy.record(captureName, {
            useLatency: true
          });
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
          fs.statSync(getCaptureFilePath(captureName));
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

  it('should record and playback call using full URLs, including custom-encoded', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-full-urls';

    // Construct remote service urls
    const path1 = '/http://example.com/some/service/one';
    const path2 = '/http://www.example.com/some/service/one';
    const path3 = '/http://www.example.com:80/some/service/one';

    const path1encoded = '/http~~~example.com/some/service/one';
    const path2encoded = '/http~~~www.example.com/some/service/one';
    const path3encoded = '/http~~~www.example.com~80/some/service/one';

    // Mount remote service end points
    remote.get(path1, { text: 'first' });
    remote.get(path2, { text: 'second' });
    remote.get(path3, { text: 'third' });

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
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, 'second', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),

        cb => proxyReq.get(path1encoded).expect(200, 'first', cb),
        cb => proxyReq.get(path2encoded).expect(200, 'second', cb),
        cb => proxyReq.get(path3encoded).expect(200, 'third', cb),

        // Stop recording
        cb => {
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          fs.statSync(getCaptureFilePath(captureName));
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
        cb => remoteReq.get(path1).expect(200, 'first', cb),
        cb => remoteReq.get(path2).expect(200, 'second', cb),
        cb => remoteReq.get(path3).expect(200, 'third', cb),

        // Assert paths are routed the correct responses
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, 'second', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),

        cb => proxyReq.get(path1encoded).expect(200, 'first', cb),
        cb => proxyReq.get(path2encoded).expect(200, 'second', cb),
        cb => proxyReq.get(path3encoded).expect(200, 'third', cb)
      ],
      done
    );
  });

  it('should record and playback call with playAll', function(done) {
    this.timeout = 10000;

    const captureName = 'test-some-fancy-capture-all';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const path1 = '/some/service/one';
    const path2 = '/some/service/two';
    const path3 = '/some/service/three';
    const path4 = '/some/service/four';
    const path5 = '/some/service/five';

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });
    remote.get('/some/service/two', { json: { second: true } });
    remote.get('/some/service/three', { text: 'third' });
    remote.get('/some/service/four', { text: 'fourth' });
    remote.get('/some/service/five', { text: 'fifth', status: 206 });

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
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, '{"second":true}', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb),
        cb => proxyReq.get(path5).expect(206, 'fifth', cb),

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
          proxy.recordStop(cb);
        },

        // Assert capture file exists
        cb => {
          fs.statSync(getCaptureFilePath(captureName));
          cb();
        },

        // Reset proxy services and play captured capture
        cb => {
          proxy.reset();
          cb();
        },

        cb => {
          proxy.playAll();
          cb();
        },

        // Test remote url paths and their sub paths route to the same services
        // Assert remote url paths are routed the correct responses
        // e.g. http://localhost:4041/http://example.com/some/service
        cb => remoteReq.get(path1).expect(200, 'first', cb),
        cb => remoteReq.get(path2).expect(200, '{"second":true}', cb),
        cb => remoteReq.get(path3).expect(200, 'third', cb),
        cb => remoteReq.get(path4).expect(200, 'fourth', cb),
        cb => remoteReq.get(path5).expect(206, 'fifth', cb),

        // Assert paths are routed the correct responses
        // e.g. http://localhost:4041/some/service
        cb => proxyReq.get(path1).expect(200, 'first', cb),
        cb => proxyReq.get(path2).expect(200, '{\n  "second": true\n}', cb),
        cb => proxyReq.get(path3).expect(200, 'third', cb),
        cb => proxyReq.get(path4).expect(200, 'fourth', cb),
        cb => proxyReq.get(path5).expect(206, 'fifth', cb)
      ],
      done
    );
  });
});
