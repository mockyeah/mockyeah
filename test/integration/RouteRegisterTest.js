'use strict';

const async = require('async');
const TestHelper = require('../TestHelper');
const MockYeahServer = require('../../server');
const supertest = require('supertest');

describe('Route register', () => {
  let mockyeah;
  let request;

  before(() => {
    mockyeah = MockYeahServer({
      port: 0
    });
    request = supertest(mockyeah.server);
  });

  after(() => mockyeah.close());

  it('should replace existing matching routes', (done) => {
    mockyeah.get('/foo', { text: 'bar', status: 200 });

    request
      .get('/foo')
      .expect(200, 'bar');

    mockyeah.get('/foo', { text: 'baa', status: 301 });

    request
      .get('/foo')
      .expect(301, 'baa', done);
  });

  it('should not replace existing matching routes with different http verbs', (done) => {
    mockyeah.get('/foo', { text: 'bar get' });
    mockyeah.post('/foo', { text: 'bar post' });
    mockyeah.put('/foo', { text: 'bar put' });
    mockyeah.delete('/foo', { text: 'bar delete' });

    async.parallel([
      (cb) => request.get('/foo').expect(200, 'bar get', cb),
      (cb) => request.post('/foo').expect(200, 'bar post', cb),
      (cb) => request.put('/foo').expect(200, 'bar put', cb),
      (cb) => request.delete('/foo').expect(200, 'bar delete', cb)
    ], done);
  });
});
