'use strict';

require('../TestHelper');
const MockYeahServer = require('../../server');

/**
 * Instantiate new server that can be closed without
 * affecting other tests.
 */
const mockyeah = MockYeahServer({ port: 0 });

const request = require('supertest')(mockyeah.server);

describe('Wondrous service', () => {
  // remove service mocks after each test
  afterEach(() => mockyeah.reset());

  // stop mockyeah server
  after(() => mockyeah.close());

  it('should create a mock service that returns an internal error', (done) => {
    // create failing service mock
    mockyeah.get('/wondrous', { status: 500 });

    // assert service mock is working
    request
      .get('/wondrous')
      .expect(500, done);
  });

  it('should create a mock service that returns JSON', (done) => {
    // create service mock that returns json data
    mockyeah.get('/wondrous', { json: { foo: 'bar' } });

    // assert service mock is working
    request
      .get('/wondrous')
      .expect(200, { foo: 'bar' }, done);
  });

  it('should verify a mock service expectation', (done) => {
    // create service mock with expectation
    const expectation = mockyeah
      .get('/wondrous', { text: 'it worked' })
      .expect()
      .params({
        foo: 'bar'
      })
      .once();

    // invoke request and verify expectation
    request
      .get('/wondrous?foo=bar')
      .expect(200, 'it worked')
      .then(() => {
        expectation.verify();
        done();
      });
  });
});
