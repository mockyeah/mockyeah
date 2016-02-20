'use strict';

const TestHelper = require('../TestHelper');
const mockyeah = TestHelper.mockyeah;
const request = TestHelper.request;

describe('Response Headers', () => {
  it('should support custom headers', (done) => {
    mockyeah.get('/some/service/end/point', { text: 'Hello.', headers: { 'Foo-Bar': 'abc' } });

    request
      .get('/some/service/end/point')
      .expect('Foo-Bar', 'abc')
      .expect(200, /Hello/, done);
  });

  it('should send header Content-Type when set and raw', (done) => {
    mockyeah.get('/some/service/end/point', { raw: 'Hello.', headers: { 'content-type': 'application/xml' } });

    request
      .get('/some/service/end/point')
      .expect('Content-Type', /application\/xml/)
      .expect(200, /Hello/, done);
  });
});