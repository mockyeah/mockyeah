'use strict';

const TestHelper = require('../TestHelper');

const { request } = TestHelper;

describe('Missed', function() {
  it('should miss unmounted mock', () =>
    request
      .get('/nope')
      .expect('x-mockyeah-missed', 'true')
      .expect(404));
});
