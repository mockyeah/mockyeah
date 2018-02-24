'use strict';

const { expect } = require('chai');
const TestHelper = require('../TestHelper');

const { mockyeah, request } = TestHelper;

describe('Route Patterns', () => {
  describe('trailing slashes', () => {
    it('should match when root mock and request use trailing slash', done => {
      mockyeah.get('//');

      request.get('//').expect(200, done);
    });

    it('should match when root mock but not request uses trailing slash', done => {
      mockyeah.get('//');

      request.get('/').expect(200, done);
    });

    it('should match when root request but not mock uses trailing slash', done => {
      mockyeah.get('/');

      request.get('//').expect(200, done);
    });

    it('should match when root mock uses trailing slash and request is blank', done => {
      mockyeah.get('//');

      request.get('').expect(200, done);
    });

    it('should match when root mock is blank and request uses trailing slash', done => {
      mockyeah.get('');

      request.get('//').expect(200, done);
    });

    it('should match when root mock uses slash and request is blank', done => {
      mockyeah.get('/');

      request.get('').expect(200, done);
    });

    it('should match when root mock is blank and request uses slash', done => {
      mockyeah.get('');

      request.get('/').expect(200, done);
    });

    it('should match when mock and request use trailing slash', done => {
      mockyeah.get('/foo/bar/');

      request.get('/foo/bar/').expect(200, done);
    });

    it('should match when mock but not request uses trailing slash', done => {
      mockyeah.get('/foo/bar/');

      request.get('/foo/bar').expect(200, done);
    });

    it('should match when request but not mock uses trailing slash', done => {
      mockyeah.get('/foo/bar');

      request.get('/foo/bar/').expect(200, done);
    });

    it('should match when mock and request use trailing slashes', done => {
      mockyeah.get('/foo/bar//');

      request.get('/foo/bar///').expect(200, done);
    });

    it('should match when mock but not request uses trailing slashes', done => {
      mockyeah.get('/foo/bar//');

      request.get('/foo/bar').expect(200, done);
    });

    it('should match when request but not mock uses trailing slashes', done => {
      mockyeah.get('/foo/bar');

      request.get('/foo/bar//').expect(200, done);
    });
  });

  it('should allow match object', done => {
    mockyeah.get({
      path: '/foo'
    });

    request.get('/foo').expect(200, done);
  });

  it('should work with path parameter', done => {
    mockyeah.get('/service/:key');

    request.get('/service/exists').expect(200, done);
  });

  it('should expose path parameters to custom middleware as keyed object', done => {
    let report = true;
    mockyeah.get('/service/:one/:two/other/:three', (req, res) => {
      try {
        expect(req.params).to.deep.equal({
          one: 'exists',
          two: 'ok',
          three: 'yes',
          0: 'exists',
          1: 'ok',
          2: 'yes'
        });
      } catch (err) {
        done(err);
        report = false;
      }
      res.send();
    });

    request.get('/service/exists/ok/other/yes').expect(200, () => {
      if (report) done();
    });
  });

  it('should expose path parameters to custom middleware as indexed array', done => {
    let report = true;
    mockyeah.get('/service/:one/:two/other/:three', (req, res) => {
      try {
        expect(req.params[1]).to.equal('ok');
      } catch (err) {
        done(err);
        report = false;
      }
      res.send();
    });

    request.get('/service/exists/ok/other/yes').expect(200, () => {
      if (report) done();
    });
  });

  it('should work with regular expression slash any count', done => {
    mockyeah.get('/service/(.{0,})');

    request.get('/service/exists').expect(200, done);
  });

  it('should work with regular expression slash any star', done => {
    mockyeah.get('/(.*)');

    request.get('/service/exists').expect(200, done);
  });

  it('should work with regular expression any star', done => {
    mockyeah.get('(.*)');

    request.get('/service/exists').expect(200, done);
  });

  it('should work with star', done => {
    mockyeah.get('*');

    request.get('/service/exists').expect(200, done);
  });

  it('should fail when doesnt match query parameters', done => {
    mockyeah.get('/foo?bar=yes');

    request.get('/foo').expect(404, done);
  });

  it('should match single query parameter', done => {
    mockyeah.get('/foo?bar=yes');

    request.get('/foo?bar=yes').expect(200, done);
  });

  it('should match single query parameter with object', done => {
    mockyeah.get({
      path: '/foo',
      query: {
        bar: 'yes'
      }
    });

    request.get('/foo?bar=yes').expect(200, done);
  });

  it('should match multiple query parameters', done => {
    mockyeah.get('/foo?bar=yes&cool=duh');

    request.get('/foo?bar=yes&cool=duh').expect(200, done);
  });

  it('should match multiple query parameters with object', done => {
    mockyeah.get({
      path: '/foo',
      query: {
        bar: 'yes',
        cool: 'duh'
      }
    });

    request.get('/foo?bar=yes&cool=duh').expect(200, done);
  });

  it('should match list query parameters', done => {
    mockyeah.get('/foo?bar=yes&list=a&list=b');

    request.get('/foo?bar=yes&list=a&list=b').expect(200, done);
  });

  it('should match list query parameters with object', done => {
    mockyeah.get({
      path: '/foo',
      query: {
        bar: 'yes',
        list: ['a', 'b']
      }
    });

    request.get('/foo?bar=yes&list=a&list=b').expect(200, done);
  });

  it('should match request body', done => {
    mockyeah.post({
      path: '/foo',
      body: {
        bar: 'yes'
      }
    });

    request
      .post('/foo')
      .send({ bar: 'yes' })
      .expect(200, done);
  });

  it('should fail to match when different request body', done => {
    mockyeah.post({
      path: '/nope',
      body: {
        bar: 'nope'
      }
    });

    request
      .post('/nope')
      .send({ bar: 'yes' })
      .expect(404, done);
  });

  it('should fail to match when no request body', done => {
    mockyeah.post({
      path: '/nope',
      body: {
        bar: 'nope'
      }
    });

    request.post('/nope').expect(404, done);
  });
});
