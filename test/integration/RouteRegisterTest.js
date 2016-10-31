'use strict';

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
});
