'use strict';

/* eslint-disable consistent-return */

const async = require('async');
const supertest = require('supertest');
require('../TestHelper');
const MockYeahServer = require('../../server');

describe('Route register', () => {
  let mockyeah;
  let request;

  before(() => {
    mockyeah = MockYeahServer({
      port: 0,
      adminPort: 0
    });
    request = supertest(mockyeah.server);
  });

  after(() => mockyeah.close());

  it('should replace existing matching routes', done => {
    mockyeah.get('/path', { text: 'bar', status: 200 });

    request.get('/path').expect(200, 'bar', err => {
      if (err) return done(err);

      mockyeah.get('/path', { text: 'baa', status: 301 });

      request.get('/path').expect(301, 'baa', done);
    });
  });

  it('should replace existing matching routes with query parameters', done => {
    mockyeah.get('/foo?bar=yes', { text: 'bar', status: 200 });

    request
      .get('/foo')
      .query('bar=yes')
      .expect(200, 'bar', err => {
        if (err) return done(err);

        mockyeah.get('/foo?bar=yes', { text: 'baa', status: 301 });

        request
          .get('/foo')
          .query('bar=yes')
          .expect(301, 'baa', done);
      });
  });

  it('should replace existing matching routes with request body', done => {
    mockyeah.post(
      {
        path: '/foo',
        body: {
          bar: 'yes'
        }
      },
      { text: 'bar', status: 200 }
    );

    request
      .post('/foo')
      .send({ bar: 'yes' })
      .expect(200, 'bar', err => {
        if (err) return done(err);

        mockyeah.post(
          {
            path: '/foo',
            body: {
              bar: 'yes'
            }
          },
          { text: 'baa', status: 301 }
        );

        request
          .post('/foo')
          .send({ bar: 'yes' })
          .expect(301, 'baa', done);
      });
  });

  it('should not replace existing matching routes with different http verbs', done => {
    mockyeah.get('/foo', { text: 'bar get' });
    mockyeah.post('/foo', { text: 'bar post' });
    mockyeah.put('/foo', { text: 'bar put' });
    mockyeah.patch('/foo', { text: 'bar patch' });
    mockyeah.delete('/foo', { text: 'bar delete' });

    async.parallel(
      [
        cb => request.get('/foo').expect(200, 'bar get', cb),
        cb => request.post('/foo').expect(200, 'bar post', cb),
        cb => request.put('/foo').expect(200, 'bar put', cb),
        cb => request.patch('/foo').expect(200, 'bar patch', cb),
        cb => request.delete('/foo').expect(200, 'bar delete', cb)
      ],
      done
    );
  });
});
