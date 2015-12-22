'use strict';

const TestHelper = require('../TestHelper');
const request = TestHelper.request;

describe('Server', () => {
  it('should respond to root http requests', (done) => {
    request
      .get('/')
      .expect(200, /Hello\, Mock Yeah\!/, done);
  });
});