'use strict';

const TestHelper = require('../TestHelper');
const MockYeahServer = require('../../server');
const supertest = require('supertest');
const async = require('async');
const expect = require('chai').expect;

describe('Route expectation', () => {
  let mockyeah;
  let request;

  before(() => {
    mockyeah = MockYeahServer({ port: 0 });
    request = supertest(mockyeah.server);
  });

  after(() => mockyeah.close());

  it('should implement never() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .never();

    async.series([
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called never, but it was called 1 times');
        cb();
      }
    ], done);
  });

  it('should implement once() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .once();

    async.series([
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called once, but it was called 0 times');
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called once, but it was called 2 times');
        cb();
      }
    ], done);
  });

  it('should implement twice() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .twice();

    async.series([
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called twice, but it was called 1 times');
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called twice, but it was called 3 times');
        cb();
      }
    ], done);
  });

  it('should implement thrice() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .thrice();

    async.series([
      (cb) => request.get('/foo').end(cb),
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called thrice, but it was called 2 times');
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called thrice, but it was called 4 times');
        cb();
      }
    ], done);
  });

  it('should implement exactly() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .exactly(7);

    async.series([
      (cb) => request.get('/foo').end(cb),
      (cb) => request.get('/foo').end(cb),
      (cb) => request.get('/foo').end(cb),
      (cb) => request.get('/foo').end(cb),
      (cb) => request.get('/foo').end(cb),
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called 7 times, but it was called 6 times');
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called 7 times, but it was called 8 times');
        cb();
      }
    ], done);
  });

  it('should implement atMost() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .atMost(3);

    async.series([
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called at most 3 times, but it was called 4 times');
        cb();
      }
    ], done);
  });

  it('should implement atLeast() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .atLeast(3);

    async.series([
      (cb) => request.get('/foo').end(cb),
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected route to be called at least 3 times, but it was called 2 times');
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      }
    ], done);
  });

  it('should implement params() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      });

    async.series([
      (cb) => request.get('/foo?id=9999').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected params did not match expected for request');
        cb();
      }
    ], done);
  });

  it('should implement body() expectation', (done) => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .body({
        foo: 'bar'
      });

    async.series([
      (cb) => request.post('/foo').send({ foo: 'bar' }).end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.post('/foo').send({ some: 'value' }).end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected body to match expected for request');
        cb();
      }
    ], done);
  });

  it('should implement header() expectation', (done) => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .header('host', 'example.com');

    async.series([
      (cb) => request.get('/foo').set('HOST', 'example.com').end(cb),
      (cb) => {
        expectation.verify();
        cb();
      },
      (cb) => request.get('/foo').set('HOST', 'unknown.com').end(cb),
      (cb) => {
        expect(expectation.verify).to.throw('Expected header value host:example.com, but it was unknown.com');
        cb();
      }
    ], done);
  });

  it('should allow composable expectations', (done) => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .header('host', 'example.com')
      .params({
        id: '9999'
      })
      .body({
        foo: 'bar'
      })
      .once();

    request
      .post('/foo?id=9999')
      .set('HOST', 'example.com')
      .send({ foo: 'bar' })
      .end(() => {
        expectation.verify();
        done();
      });
  });
});
