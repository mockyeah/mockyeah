'use strict';

const TestHelper = require('../TestHelper');
const mockyeah = TestHelper.mockyeah;
const request = TestHelper.request;

describe('Response Status', () => {
  it('should return 404 for undeclared services', (done) => {
    request
      .get('/some/non/existent/service/end/point')
      .expect(404, done);
  });

  it('should return a default status code of 200', (done) => {
    mockyeah.get('/service/exists');

    request
      .get('/service/exists')
      .expect(200, done);
  });

  it('should support declarative status code 301', (done) => {
    mockyeah.get('/some/service/end/point', { status: 301 });

    request
      .get('/some/service/end/point')
      .expect(301, done);
  });

  it('should support declarative status code 500', (done) => {
    mockyeah.get('/some/service/end/point', { status: 500 });

    request
      .get('/some/service/end/point')
      .expect(500, done);
  });
});