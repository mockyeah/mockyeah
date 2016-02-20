'use strict';
const path = require('path');
global.MOCK_YEAH_ROOT = path.resolve('test');
const app = require('../../app');
const mockyeah = require('../../index');
const request = require('supertest');

const dummyMiddleware = (req, res, next) => {
  res.set('custom', 'middleware');
  next();
};

const middlewareValidation = (req, res) => {
  const customHeader = res.get('custom');

  if (customHeader) {
    res.status(200);
    res.send('PASSING');
  } else {
    res.status(500);
  }
};

app.use(dummyMiddleware);

describe('Applicaton middleware', () => {
  describe('using the app directory', () => {
    it('should be exposed for external use', (done) => {
      app.get('/validate', middlewareValidation);

      request(app)
        .get('/validate')
        .expect(200, /PASSING/, done);
    });
  });

  describe('when used with mockyeah', () => {
    afterEach(() => mockyeah.reset());

    it('should be exposed for external use', (done) => {
      mockyeah.get('/mockyeah-validation', middlewareValidation);

      request('http://localhost:4041')
        .get('/mockyeah-validation')
        .expect(200, /PASSING/, done);
    });
  });
});
