'use strict';

const TestHelper = require('../TestHelper');

const { mockyeah, request } = TestHelper;

describe('Response Validation', () => {
  it('should support string response options', done => {
    mockyeah.get('/some/service/end/point', 'hey there');

    request.get('/some/service/end/point').expect(200, 'hey there', done);
  });
});
