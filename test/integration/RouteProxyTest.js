'use strict';

require('../TestHelper');
const async = require('async');
const express = require('express');
const MockYeahServer = require('../../server');
const supertest = require('supertest');

describe('Route proxy', () => {
  let mockyeah;
  let proxiedApp;
  let proxiedServer;
  let request;

  before(done => {
    async.parallel([
      cb => {
        mockyeah = MockYeahServer({
          port: 0
        }, cb);
        request = supertest(mockyeah.server);
      },
      cb => {
        proxiedApp = express();
        proxiedApp.get('/foo', (req, res) => res.sendStatus(200));
        proxiedServer = proxiedApp.listen(8888, cb);
      }
    ], done);
  });

  after(done => {
    async.parallel([
      cb => mockyeah.close(cb),
      cb => proxiedServer.close(cb)
    ], done);
  });

  beforeEach(() => {
    mockyeah.proxy();
  });

  afterEach(() => {
    mockyeah.reset();
  });

  it('should support registering full URLs manually', done => {
    mockyeah.get('/http://localhost:8888/foo?ok=yes', { text: 'bar', status: 500 });

    async.series([
      cb => supertest(proxiedApp).get('/foo').expect(200, cb),
      cb => request.get('/http://localhost:8888/foo?ok=yes').expect(500, 'bar', cb)
    ], done);
  });

  it('should support proxying other URLs', done => {
    request.get('/http://localhost:8888/foo?ok=yes').expect(200, done);
  });
  
  it('should support proxying other URLs even with other mocks', done => {
    mockyeah.get('/http://localhost:8888/bar', { text: 'bar' });

    request.get('/http://localhost:8888/foo?ok=yes').expect(200, done);
  });
});
