'use strict';

const TestHelper = require('../TestHelper');
const MockYeahServer = require('../../server');
const supertest = require('supertest');
const async = require('async');

describe('Route reset', () => {
  let mockyeah;
  let request;

  before(() => {
    mockyeah = MockYeahServer({
      port: 0
    });
    request = supertest(mockyeah.server);
  });

  after(() => mockyeah.close());
  afterEach(() => mockyeah.reset());

  it('should reset all routes when no paths are passed', (done) => {
    mockyeah.get('/foo-1', { text: 'bar' });
    mockyeah.get('/foo-2', { text: 'bar' });
    mockyeah.get('/foo-3', { text: 'bar' });
    mockyeah.get('/foo-4', { text: 'bar' });

    async.series([
      (cb) => request.get('/foo-1').expect(200, cb),
      (cb) => request.get('/foo-2').expect(200, cb),
      (cb) => request.get('/foo-3').expect(200, cb),
      (cb) => request.get('/foo-4').expect(200, cb),
      (cb) => {
        mockyeah.reset();
        cb();
      },
      (cb) => request.get('/foo-1').expect(404, cb),
      (cb) => request.get('/foo-2').expect(404, cb),
      (cb) => request.get('/foo-3').expect(404, cb),
      (cb) => request.get('/foo-4').expect(404, cb)
    ], done);
  });

  it('should reset a single route when a matching path is passed', (done) => {
    mockyeah.get('/foo-1', { text: 'bar' });
    mockyeah.get('/foo-2', { text: 'bar' });
    mockyeah.get('/foo-3', { text: 'bar' });
    mockyeah.get('/foo-4', { text: 'bar' });

    async.series([
      (cb) => request.get('/foo-1').expect(200, cb),
      (cb) => request.get('/foo-2').expect(200, cb),
      (cb) => request.get('/foo-3').expect(200, cb),
      (cb) => request.get('/foo-4').expect(200, cb),
      (cb) => {
        mockyeah.reset('/foo-2');
        cb();
      },
      (cb) => request.get('/foo-1').expect(200, cb),
      (cb) => request.get('/foo-2').expect(404, cb),
      (cb) => request.get('/foo-3').expect(200, cb),
      (cb) => request.get('/foo-4').expect(200, cb)
    ], done);
  });

  it('should reset multiple route when a matching paths are passed', (done) => {
    mockyeah.get('/foo-1', { text: 'bar' });
    mockyeah.get('/foo-2', { text: 'bar' });
    mockyeah.get('/foo-3', { text: 'bar' });
    mockyeah.get('/foo-4', { text: 'bar' });

    async.series([
      (cb) => request.get('/foo-1').expect(200, cb),
      (cb) => request.get('/foo-2').expect(200, cb),
      (cb) => request.get('/foo-3').expect(200, cb),
      (cb) => request.get('/foo-4').expect(200, cb),
      (cb) => {
        mockyeah.reset('/foo-2', '/foo-3');
        cb();
      },
      (cb) => request.get('/foo-1').expect(200, cb),
      (cb) => request.get('/foo-2').expect(404, cb),
      (cb) => request.get('/foo-3').expect(404, cb),
      (cb) => request.get('/foo-4').expect(200, cb)
    ], done);
  });
});
