'use strict';

const TestHelper = require('../TestHelper');

const { mockyeah, request } = TestHelper;

describe('Response Headers', () => {
  it('should support custom headers', done => {
    mockyeah.get('/some/service/end/point', { text: 'Hello.', headers: { 'Foo-Bar': 'abc' } });

    request
      .get('/some/service/end/point')
      .expect('Foo-Bar', 'abc')
      .expect(200, /Hello/, done);
  });

  it('should send header Content-Type when set and raw', done => {
    mockyeah.get('/some/service/end/point', {
      raw: 'Hello.',
      headers: { 'content-type': 'text/xml' }
    });

    request
      .get('/some/service/end/point')
      .expect('Content-Type', /\/xml/)
      .expect(200, /Hello/, done);
  });
});
