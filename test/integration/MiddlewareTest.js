'use strict';

require('../TestHelper');
const MockYeahServer = require('../../server');
const request = require('supertest');

/**
 * Instantiate new mockyeah server so that `TestHelper.mockyeah`
 * is not affected with middleware.
 */
const mockyeah = new MockYeahServer({ port: 0 });

const dummyMiddleware = (req, res, next) => {
  res.set('custom', 'middleware');
  next();
};

const validateMiddleware = (req, res) => {
  const customHeader = res.get('custom');

  if (customHeader) {
    res.send('PASSING');
  } else {
    res.status(500);
  }
};

mockyeah.use(dummyMiddleware);

describe('Application Middleware', () => {
  afterEach(() => mockyeah.reset());
  after(() => mockyeah.close());

  it('should be exposed for external use', (done) => {
    mockyeah.get('/validate', validateMiddleware);

    request(mockyeah.server)
      .get('/validate')
      .expect(200, /PASSING/, done);
  });
});
