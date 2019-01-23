'use strict';

const { expect } = require('chai');
const async = require('async');
const express = require('express');
const bodyParser = require('body-parser');
const supertest = require('supertest');
require('../TestHelper');
const MockYeahServer = require('../../server');

describe('Route proxy', () => {
  let mockyeah;
  let proxiedApp;
  let proxiedServer;
  let request;
  let proxiedPort;
  let receivedHeaders = {};
  let receivedBody;

  before(done => {
    async.parallel(
      [
        cb => {
          mockyeah = MockYeahServer(
            {
              port: 0,
              adminPort: 0,
              proxy: true,
              responseHeaders: false
            },
            cb
          );
          request = supertest(mockyeah.server);
        },
        cb => {
          proxiedApp = express();
          proxiedApp.use(bodyParser.json());
          proxiedApp.all('/foo', (req, res) => {
            receivedHeaders = Object.assign(receivedHeaders, req.headers);
            receivedBody = req.body;
            res.sendStatus(200);
          });
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
        cb =>
          request
            .get(`/http://localhost:${proxiedPort}/foo?ok=yes`)
            .expect(500, 'bar')
            .end((err, res) => {
              if (err) {
                cb(err);
                return;
              }

              expect(res.headers).to.not.have.key('x-mockyeah-mocked');

              cb();
            })
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

  it('should support proxying other URLs', done => {
    request.get(`/http://localhost:${proxiedPort}/foo?ok=yes`).expect(200, done);
  });

  it('should pass headers and body to proxied service', done => {
    request
      .post(`/http://localhost:${proxiedPort}/foo?ok=yes`)
      .set('X-Foo', 'bar')
      .send({ foo: 'bar' })
      .expect(200, err => {
        if (err) {
          done(err);
          return;
        }
        try {
          expect(receivedHeaders['x-foo']).to.equal('bar');
          expect(receivedBody).to.deep.equal({ foo: 'bar' });
          done();
        } catch (err2) {
          done(err2);
        }
      });
  });

  it('should support proxying other URLs even with other mocks', done => {
    mockyeah.get(`/http://localhost:${proxiedPort}/bar`, { text: 'bar' });

    request
      .get(`/http://localhost:${proxiedPort}/foo?ok=yes`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        expect(res.headers).to.not.have.key('x-mockyeah-proxied');

        done();
      });
  });

  it('should bypass non-mounted, non-absolute URLs', done => {
    request.get('/bar').expect(404, done);
  });
});
