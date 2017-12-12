'use strict';

const TestHelper = require('../TestHelper');
const mockyeah = TestHelper.mockyeah;
const request = TestHelper.request;

describe('Route Patterns', () => {
  it('should work with route parameter', (done) => {
    mockyeah.get('/service/:key');

    request
      .get('/service/exists')
      .expect(200, done);
  });

  it('should work with regular expression slash any count', (done) => {
    mockyeah.get('/service/(.{0,})');

    request
      .get('/service/exists')
      .expect(200, done);
  });

  it('should work with regular expression slash any star', (done) => {
    mockyeah.get('/(.*)');

    request
      .get('/service/exists')
      .expect(200, done);
  });

  it('should work with regular expression any star', (done) => {
    mockyeah.get('(.*)');

    request
      .get('/service/exists')
      .expect(200, done);
  });

  it('should work with star', (done) => {
    mockyeah.get('*');

    request
      .get('/service/exists')
      .expect(200, done);
  });
});