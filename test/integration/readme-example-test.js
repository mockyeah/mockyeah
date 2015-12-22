'use strict';

const request = require('supertest')('http://localhost:4041');
const mockyeah = require('../../index.js');

describe('Wondrous service', () => {
  // remove service mocks after each test
  afterEach(() => mockyeah.reset());

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
});