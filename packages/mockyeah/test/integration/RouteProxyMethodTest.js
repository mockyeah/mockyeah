'use strict';

const async = require('async');
const express = require('express');
const supertest = require('supertest');
const MockYeahServer = require('../../server');

describe('Route proxy method', () => {
  let mockyeah;
  let proxiedApp;
  let proxiedServer;
  let request;
  let proxiedPort;

  before(done => {
    async.parallel(
      [
        cb => {
          mockyeah = MockYeahServer(
            {
              port: 0,
              adminPort: 0,
              aliases: [['http://localhost', 'http://localhost.alias.com']]
            },
            cb
          );
          request = supertest(mockyeah.server);
        },
        cb => {
          proxiedApp = express();
          proxiedApp.get('/foo', (req, res) => res.sendStatus(200));
          proxiedServer = proxiedApp.listen(0, err => {
            if (err) {
              cb(err);
              return;
            }
            proxiedPort = proxiedServer.address().port;
            cb();
          });
        }
      ],
      done
    );
  });

  after(done => {
    async.parallel([cb => mockyeah.close(cb), cb => proxiedServer.close(cb)], done);
  });

  beforeEach(() => {
    mockyeah.proxy();
  });

  afterEach(() => {
    mockyeah.reset();
  });

  it('should support registering full URLs manually', done => {
    mockyeah.get(`/http://localhost:${proxiedPort}/foo?ok=yes`, { text: 'bar', status: 500 });

    async.series(
      [
        cb =>
          supertest(proxiedApp)
            .get('/foo')
            .expect(200, cb),
        cb => request.get(`/http://localhost:${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
      ],
      done
    );
  });

  it('should support registering full URLs manually with wildcards', done => {
    mockyeah.get(`/http://localhost:${proxiedPort}/f(.*)`, { text: 'bar', status: 500 });

    async.series(
      [
        cb =>
          supertest(proxiedApp)
            .get('/foo')
            .expect(200, cb),
        cb => request.get(`/http://localhost:${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
      ],
      done
    );
  });

  it('should support registering full URLs manually without leading slash', done => {
    mockyeah.get(`http://localhost:${proxiedPort}/foo?ok=yes`, { text: 'bar', status: 500 });

    async.series(
      [
        cb =>
          supertest(proxiedApp)
            .get('/foo')
            .expect(200, cb),
        cb => request.get(`/http://localhost:${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
      ],
      done
    );
  });

  it('should support registering full URLs manually with environment aliases', done => {
    mockyeah.get(`http://localhost.alias.com:${proxiedPort}/foo?ok=yes`, {
      text: 'bar',
      status: 500
    });

    async.series(
      [
        cb =>
          supertest(proxiedApp)
            .get('/foo')
            .expect(200, cb),
        cb => request.get(`/http://localhost:${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
      ],
      done
    );
  });

  it('should support registering full URLs manually with environment aliases with encoding', done => {
    mockyeah.get(`http://localhost.alias.com:${proxiedPort}/foo?ok=yes`, {
      text: 'bar',
      status: 500
    });

    async.series(
      [
        cb =>
          supertest(proxiedApp)
            .get('/foo')
            .expect(200, cb),
        cb => request.get(`/http~~~localhost~${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
      ],
      done
    );
  });

  describe('custom-encoded URLs', () => {
    it('should support registering full URLs and matching request with custom-encoded URLs', done => {
      mockyeah.get(`/http://localhost:${proxiedPort}/foo?ok=yes`, { text: 'bar', status: 500 });

      async.series(
        [
          cb =>
            supertest(proxiedApp)
              .get('/foo')
              .expect(200, cb),
          cb => request.get(`/http~~~localhost~${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
        ],
        done
      );
    });

    it('should support registering full URLs and matching request with custom-encoded URLs with regex', done => {
      mockyeah.get(new RegExp(`http://localhost:${proxiedPort}`), { text: 'bar', status: 500 });

      async.series(
        [
          cb =>
            supertest(proxiedApp)
              .get('/foo')
              .expect(200, cb),
          cb => request.get(`/http~~~localhost~${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
        ],
        done
      );
    });

    it('should support registering full URLs and matching request with custom-encoded URLs with function', done => {
      mockyeah.get(p => p === `/http://localhost:${proxiedPort}/foo`, {
        text: 'bar',
        status: 500
      });

      async.series(
        [
          cb =>
            supertest(proxiedApp)
              .get('/foo')
              .expect(200, cb),
          cb => request.get(`/http~~~localhost~${proxiedPort}/foo?ok=yes`).expect(500, 'bar', cb)
        ],
        done
      );
    });

    it('should support proxying custom-encoded URLs', done => {
      request.get(`/http~~~localhost~${proxiedPort}/foo`).expect(200, done);
    });
  });

  it('should support proxying other URLs', done => {
    request.get(`/http://localhost:${proxiedPort}/foo?ok=yes`).expect(200, done);
  });

  it('should support proxying other URLs even with other mocks', done => {
    mockyeah.get(`/http://localhost:${proxiedPort}/bar`, { text: 'bar' });

    request.get(`/http://localhost:${proxiedPort}/foo?ok=yes`).expect(200, done);
  });
});
