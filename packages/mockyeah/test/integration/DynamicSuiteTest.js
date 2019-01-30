'use strict';

const MockYeahServer = require('../../server');
const supertest = require('supertest');

describe('Dynamic Suites', function() {
  let mockyeah;
  let request;

  before(done => {
    mockyeah = new MockYeahServer(
      {
        port: 0,
        adminPort: 0,
        capturesDir: `${__dirname}/../mockyeah`,
        aliases: [['http://localhost', 'http://localhost.alias.com']]
      },
      done
    );
    request = supertest(mockyeah.server);
  });

  it('should dynamically enable a suite per-request', function(done) {
    request
      .get('/say-hello')
      .set('x-mockyeah-suite', 'some-custom-capture')
      .expect(200, /hello there/, done);
  });

  it('should support full URL', function(done) {
    request
      .get('/http://localhost/say-hello')
      .set('x-mockyeah-suite', 'some-custom-capture')
      .expect(200, /hello absolute/, done);
  });

  it('should support aliases', function(done) {
    request
      .get('/http://localhost.alias.com/say-hello')
      .set('x-mockyeah-suite', 'some-custom-capture')
      .expect(200, /hello absolute/, done);
  });

  it('should ignore non-existent dynamic suite', function(done) {
    request
      .get('/say-hello')
      .set('x-mockyeah-suite', 'some-nonexistent-capture')
      .expect(404, done);
  });
});
