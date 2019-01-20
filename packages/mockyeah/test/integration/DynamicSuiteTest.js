'use strict';

const TestHelper = require('../TestHelper');

const { request } = TestHelper;

describe('Dynamic Suites', function() {
  it('should dynamically enable a suite per-request', function(done) {
    request
      .get('/say-hello')
      .set('x-mockyeah-suite', 'some-custom-capture')
      .expect(200, /hello there/, done);
  });

  it('should ignore non-existent dynamic suite', function(done) {
    request
      .get('/say-hello')
      .set('x-mockyeah-suite', 'some-nonexistent-capture')
      .expect(404, done);
  });
});
