'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const expect = require('chai').expect;
const supertest = require('supertest');
const rimraf = require('rimraf');
const MockYeahServer = require('../../server');

const PROXY_FIXTURES_DIR = path.resolve(__dirname, '../.tmp/proxy/fixtures');

describe('Fixture Record and Playback', function() {
  let request;
  let proxy;
  let remote;

  before(() => {
    // Instantiate proxy server for recording
    proxy = MockYeahServer({
      name: 'proxy',
      port: 0,
      fixturesDir: PROXY_FIXTURES_DIR
    });

    // Instantiate remote server
    remote = MockYeahServer({
      name: 'remote',
      port: 0
    });

    request = supertest(proxy.server);

    getRemotePath = getRemotePath.bind(remote);
  });

  afterEach(() => {
    proxy.reset();
    remote.reset();
    rimraf.sync(PROXY_FIXTURES_DIR);
  });

  after(() => {
    proxy.close();
    remote.close();
  });

  function getRemotePath(_path) {
    return `/http://localhost:${this.server.address().port}${_path}`;
  }

  function getCaptureFilePath(fixtureName, remoteUrl) {
    const fileName = remoteUrl.replace(/^\/?/, '').replace(/\//g, '|');
    return path.resolve(PROXY_FIXTURES_DIR, fixtureName, fileName);
  }

  it('should record and playback fixture', function(done) {
    const fixtureName = 'some-fancy-fixture';

    // Construct remote service urls
    // e.g. http://localhost:4041/http://example.com/some/service
    const remoteUrl1 = getRemotePath('/some/service/one');
    const remoteUrl2 = getRemotePath('/some/service/two');
    const remoteUrl3 = getRemotePath('/some/service/three');
    const remoteUrl4 = getRemotePath('/some/service/four');
    const remoteUrl5 = getRemotePath('/some/service/five');

    // Determine file save locations from fixture name and remote service urls
    const filePath1 = getCaptureFilePath(fixtureName, remoteUrl1);
    const filePath2 = getCaptureFilePath(fixtureName, remoteUrl2);
    const filePath3 = getCaptureFilePath(fixtureName, remoteUrl3);
    const filePath4 = getCaptureFilePath(fixtureName, remoteUrl4);
    const filePath5 = getCaptureFilePath(fixtureName, remoteUrl5);

    // Mount remote service end points
    remote.get('/some/service/one', { text: 'first' });
    remote.get('/some/service/two', { text: 'second' });
    remote.get('/some/service/three', { text: 'third' });
    remote.get('/some/service/four', { text: 'fourth' });
    remote.get('/some/service/five', { text: 'fifth' });

    // Initiate recording and playback series
    async.series([
      // Initiate recording
      (cb) => { proxy.record(fixtureName); cb() },

      // Invoke requests to remote services through proxy
      // e.g. http://localhost:4041/http://example.com/some/service
      (cb) => request.get(remoteUrl1).expect(200, 'first', cb),
      (cb) => request.get(remoteUrl2).expect(200, 'second', cb),
      (cb) => request.get(remoteUrl3).expect(200, 'third', cb),
      (cb) => request.get(remoteUrl4).expect(200, 'fourth', cb),
      (cb) => request.get(remoteUrl5).expect(200, 'fifth', cb),

      // Assert files exist
      (cb) => { fs.statSync(filePath1); cb() },
      (cb) => { fs.statSync(filePath2); cb() },
      (cb) => { fs.statSync(filePath3); cb() },
      (cb) => { fs.statSync(filePath4); cb() },
      (cb) => { fs.statSync(filePath5); cb() },

      // Reset proxy services and play captured fixture
      (cb) => { proxy.reset(); cb() },
      (cb) => { proxy.play(fixtureName); cb() },

      // Test remote url paths and their sub paths route to the same services
      // Assert remote url paths are routed the correct responses
      // e.g. http://localhost:4041/http://example.com/some/service
      (cb) => request.get(remoteUrl1).expect(200, 'first', cb),
      (cb) => request.get(remoteUrl2).expect(200, 'second', cb),
      (cb) => request.get(remoteUrl3).expect(200, 'third', cb),
      (cb) => request.get(remoteUrl4).expect(200, 'fourth', cb),
      (cb) => request.get(remoteUrl5).expect(200, 'fifth', cb),

      // Assert paths are routed the correct responses
      // e.g. http://localhost:4041/some/service
      (cb) => request.get('/some/service/one').expect(200, 'first', cb),
      (cb) => request.get('/some/service/two').expect(200, 'second', cb),
      (cb) => request.get('/some/service/three').expect(200, 'third', cb),
      (cb) => request.get('/some/service/four').expect(200, 'fourth', cb),
      (cb) => request.get('/some/service/five').expect(200, 'fifth', cb)
    ], done);
  });
});