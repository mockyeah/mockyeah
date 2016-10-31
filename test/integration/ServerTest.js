'use strict';

const TestHelper = require('../TestHelper');
const request = TestHelper.request;

describe('Server', () => {
  it('should respond to root http requests', (done) => {
    request
      .get('/')
      .expect(200, /Hello\, mockyeah\!/, done);
  });

  it('should respond with a 404 for unknown paths', (done) => {
    request.get('/unknown/path').expect(404, done);
  });
});