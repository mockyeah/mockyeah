'use strict';

const { expect } = require('chai');
const TestHelper = require('../TestHelper');

const { mockyeah, request } = TestHelper;

describe('Route Patterns', () => {
  it('should support matching response options as string', () => {
    mockyeah.get('/', 'hey there');

    return request.get('/').expect(200, 'hey there');
  });

  describe('method', () => {
    it('should match method if passed as option', done => {
      mockyeah.all({
        path: '/',
        method: 'post'
      });

      request.post('/').expect(200, done);
    });

    it('should match method in uppercase if passed as option', done => {
      mockyeah.all({
        path: '/',
        method: 'POST'
      });

      request.post('/').expect(200, done);
    });

    it('should match only method if passed as option', done => {
      mockyeah.all({
        path: '/',
        method: 'get'
      });

      request.post('/').expect(404, done);
    });
  });

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

  it('should match path as function', done => {
    mockyeah.get(p => p === '/service/exists');

    request.get('/service/exists').expect(200, done);
  });

  it('should match path as function in object', done => {
    mockyeah.get({
      path: p => p === '/service/exists'
    });

    request.get('/service/exists').expect(200, done);
  });

  it('should work with actual regular expression', done => {
    mockyeah.get(/\/service\/(.{0,})/);

    request.get('/service/exists').expect(200, done);
  });

  it('should work with actual regular expression in object', done => {
    mockyeah.get({
      path: /\/service\/(.{0,})/
    });

    request.get('/service/exists').expect(200, done);
  });

  it('should work with actual regular expression and absolute url', done => {
    mockyeah.get(/\/https:\/\/example.com\/service\/(.{0,})/);

    request.get('/https://example.com/service/exists').expect(200, done);
  });

  it('should work with actual regular expression and absolute url without slash prefix', done => {
    mockyeah.get(/https:\/\/example.com\/service\/(.{0,})/);

    request.get('/https://example.com/service/exists').expect(200, done);
  });

  it('should work with actual regular expression and absolute url in object', done => {
    mockyeah.get({
      path: /\/https:\/\/example.com\/service\/(.{0,})/
    });

    request.get('/https://example.com/service/exists').expect(200, done);
  });

  it('should work with regular expression slash any count', done => {
    mockyeah.get('/service/(.*)');

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

  it('should fail when does not match query parameters', done => {
    mockyeah.get('/foo?bar=yes');

    request.get('/foo').expect(404, done);
  });

  it('should match single query parameter', done => {
    mockyeah.get('/foo?bar=yes');

    request.get('/foo?bar=yes').expect(200, done);
  });

  it('should allow match object with `url` as alias of `path`', done => {
    mockyeah.get({
      url: '/foo?bar=yes'
    });

    request.get('/foo?bar=yes').expect(200, done);
  });

  it('should match path alone with object', done => {
    mockyeah.get({
      path: '/foo'
    });

    request.get('/foo').expect(200, done);
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

  it('should match query parameter as number with object', done => {
    mockyeah.get({
      path: '/foo',
      query: {
        bar: 1
      }
    });

    request.get('/foo?bar=1').expect(200, done);
  });

  it('should match merging query parameter in string and object', done => {
    mockyeah.get({
      path: '/foo?bar=yes',
      query: {
        baz: 'ok'
      }
    });

    request.get('/foo?bar=yes&baz=ok').expect(200, done);
  });

  it('should match merging query parameter in object and string', done => {
    mockyeah.get({
      path: '/foo?baz=ok',
      query: {
        bar: 'yes'
      }
    });

    request.get('/foo?bar=yes&baz=ok').expect(200, done);
  });

  it('should match single query parameter in path with object', done => {
    mockyeah.get({
      path: '/foo?bar=yes'
    });

    request.get('/foo?bar=yes').expect(200, done);
  });

  it('should not match without single query parameter in path with object', done => {
    mockyeah.get({
      path: '/foo?bar=yes'
    });

    request.get('/foo').expect(404, done);
  });

  it('should match single query parameter with object and regex', done => {
    mockyeah.get({
      path: '/foo',
      query: {
        bar: /e/
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

  it('should match multiple query parameters with object and regex', done => {
    mockyeah.get({
      path: '/foo',
      query: {
        bar: /s/,
        cool: /d/
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

  it('should match request body as json', done => {
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

  it('should match request body as string', done => {
    mockyeah.post({
      path: '/foo',
      body: 'test'
    });

    request
      .post('/foo')
      .set('Content-Type', 'text/plain')
      .send('test')
      .expect(200, done);
  });

  it('should match request body as regex', done => {
    mockyeah.post({
      path: '/foo',
      body: /es/
    });

    request
      .post('/foo')
      .set('Content-Type', 'text/plain')
      .send('test')
      .expect(200, done);
  });

  it('should match request body as function', done => {
    mockyeah.post({
      path: '/foo',
      body: value => value === 'test'
    });

    request
      .post('/foo')
      .set('Content-Type', 'text/plain')
      .send('test')
      .expect(200, done);
  });

  it('should match request body with nested regex', done => {
    mockyeah.post({
      path: '/foo',
      body: {
        bar: /es/
      }
    });

    request
      .post('/foo')
      .send({ bar: 'yes' })
      .expect(200, done);
  });

  it('should match request body with nested function', done => {
    mockyeah.post({
      path: '/foo',
      body: {
        bar: value => value === 'yes'
      }
    });
    request
      .post('/foo')
      .send({ bar: 'yes' })
      .expect(200, done);
  });

  it('should match with partial request body', done => {
    mockyeah.post({
      path: '/foo',
      body: {
        bar: 'yes',
        nest: {
          deep: 'too'
        }
      }
    });

    request
      .post('/foo')
      .send({
        bar: 'yes',
        nest: {
          deep: 'too',
          also: 'more'
        },
        and: 'this'
      })
      .expect(200, done);
  });

  it('should match with partial request body and deep nested regex', done => {
    mockyeah.post({
      path: '/foo',
      body: {
        bar: 'yes',
        nest: {
          deep: /oo/
        }
      }
    });

    request
      .post('/foo')
      .send({
        bar: 'yes',
        nest: {
          deep: 'too',
          also: 'more'
        },
        and: 'this'
      })
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

  it('should fail to match when different request body and regex', done => {
    mockyeah.post({
      path: '/nope',
      body: {
        bar: /op/
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

  it('should fail to match when no request body', done => {
    mockyeah.post({
      path: '/nope',
      body: {
        bar: /no/
      }
    });

    request.post('/nope').expect(404, done);
  });

  it('should fail to match with partial different request body and deep nested regex', done => {
    mockyeah.post({
      path: '/foo',
      body: {
        bar: 'yes',
        nest: {
          deep: /oo/
        }
      }
    });

    request
      .post('/foo')
      .send({
        bar: 'yes',
        nest: {
          deep: 'nope',
          also: 'more'
        },
        and: 'this'
      })
      .expect(404, done);
  });

  it('should match request headers', done => {
    mockyeah.get({
      path: '/foo',
      headers: {
        bar: 'yes'
      }
    });

    request
      .get('/foo')
      .set('bar', 'yes')
      .expect(200, done);
  });

  it('should match request header names with any casing', done => {
    mockyeah.get({
      path: '/foo',
      headers: {
        bar: 'yes',
        BAZ: 'also'
      }
    });

    request
      .get('/foo')
      .set('BAR', 'yes')
      .set('baz', 'also')
      .expect(200, done);
  });

  it('should match request headers with regex', done => {
    mockyeah.get({
      path: '/foo',
      headers: {
        bar: /yes/
      }
    });

    request
      .get('/foo')
      .set('bar', 'yes')
      .expect(200, done);
  });

  it('should match request headers with nested function', done => {
    mockyeah.get({
      path: '/foo',
      headers: {
        bar: value => value === 'yes'
      }
    });

    request
      .get('/foo')
      .set('bar', 'yes')
      .expect(200, done);
  });

  it('should match with partial request headers', done => {
    mockyeah.get({
      path: '/foo',
      headers: {
        bar: 'yes'
      }
    });

    request
      .get('/foo')
      .set('bar', 'yes')
      .set('and', 'this')
      .expect(200, done);
  });

  it('should match with partial request headers with regex', done => {
    mockyeah.get({
      path: '/foo',
      headers: {
        bar: /ye/
      }
    });

    request
      .get('/foo')
      .set('bar', 'yes')
      .set('and', 'this')
      .expect(200, done);
  });

  it('should match with partial request headers with function', done => {
    mockyeah.get({
      path: '/foo',
      headers: value => value.bar === 'yes' && value.and === 'this'
    });

    request
      .get('/foo')
      .set('bar', 'yes')
      .set('and', 'this')
      .expect(200, done);
  });

  it('should match with partial request headers with nested function', done => {
    mockyeah.get({
      path: '/foo',
      headers: {
        bar: value => value === 'yes'
      }
    });

    request
      .get('/foo')
      .set('bar', 'yes')
      .set('and', 'this')
      .expect(200, done);
  });

  it('should fail to match when different request headers', done => {
    mockyeah.get({
      path: '/nope',
      headers: {
        bar: 'nope'
      }
    });

    request
      .get('/nope')
      .set('bar', 'yes')
      .expect(404, done);
  });

  it('should fail to match when different request headers with regex', done => {
    mockyeah.get({
      path: '/nope',
      headers: {
        bar: /nop/
      }
    });

    request
      .get('/nope')
      .set('bar', 'yes')
      .expect(404, done);
  });

  it('should fail to match when different request headers with function', done => {
    mockyeah.get({
      path: '/nope',
      headers: {
        bar: value => value === 'nope'
      }
    });

    request
      .get('/nope')
      .set('bar', 'yes')
      .expect(404, done);
  });

  it('should fail to match when no request headers', done => {
    mockyeah.get({
      path: '/nope',
      headers: {
        bar: 'nope'
      }
    });

    request.get('/nope').expect(404, done);
  });

  it('should fail to match when no request headers with regex', done => {
    mockyeah.get({
      path: '/nope',
      headers: {
        bar: /pe/
      }
    });

    request.get('/nope').expect(404, done);
  });

  it('should fail to match when no request headers with function', done => {
    mockyeah.get({
      path: '/nope',
      headers: {
        bar: value => value === 'yes'
      }
    });

    request.get('/nope').expect(404, done);
  });
});
