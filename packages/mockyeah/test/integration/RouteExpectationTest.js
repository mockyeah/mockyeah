'use strict';

const supertest = require('supertest');
const async = require('async');
const { expect } = require('chai');
const assert = require('assert');
require('../TestHelper');
const MockYeahServer = require('../../server');

describe('Route expectation', () => {
  let mockyeah;
  let request;

  before(() => {
    mockyeah = MockYeahServer({ port: 0, adminPort: 0 });
    request = supertest(mockyeah.server);
  });

  after(() => mockyeah.close());

  it('should implement never() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .never();

    async.series(
      [
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called never, but it was called 1 times'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should implement once() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .once();

    async.series(
      [
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called once, but it was called 0 times'
          );
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called once, but it was called 2 times'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should implement twice() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .twice();

    async.series(
      [
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called twice, but it was called 1 times'
          );
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called twice, but it was called 3 times'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should implement thrice() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .thrice();

    async.series(
      [
        cb => request.get('/foo').end(cb),
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called thrice, but it was called 2 times'
          );
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called thrice, but it was called 4 times'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should implement exactly() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .exactly(7);

    async.series(
      [
        cb => request.get('/foo').end(cb),
        cb => request.get('/foo').end(cb),
        cb => request.get('/foo').end(cb),
        cb => request.get('/foo').end(cb),
        cb => request.get('/foo').end(cb),
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called 7 times, but it was called 6 times'
          );
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called 7 times, but it was called 8 times'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should implement atMost() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .atMost(3);

    async.series(
      [
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called at most 3 times, but it was called 4 times'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should implement atLeast() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .atLeast(3);

    async.series(
      [
        cb => request.get('/foo').end(cb),
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called at least 3 times, but it was called 2 times'
          );
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        }
      ],
      done
    );
  });

  it('should implement params() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      });

    async.series(
      [
        cb => request.get('/foo?id=9999').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw('Params did not match expected');
          cb();
        }
      ],
      done
    );
  });

  it('should implement params() function expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params(params =>
        assert.deepEqual(params, {
          id: '9999'
        })
      );

    async.series(
      [
        cb => request.get('/foo?id=9999').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo').end(cb),
        cb => {
          expect(expectation.verify).to.throw('Params did not match expectation callback');
          cb();
        }
      ],
      done
    );
  });

  it('should implement body() expectation', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .body({
        foo: 'bar'
      });

    async.series(
      [
        cb =>
          request
            .post('/foo')
            .send({ foo: 'bar' })
            .end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb =>
          request
            .post('/foo')
            .send({ some: 'value' })
            .end(cb),
        cb => {
          expect(expectation.verify).to.throw('Body did not match expected');
          cb();
        }
      ],
      done
    );
  });

  it('should implement body() function expectation', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .body(body =>
        assert.deepEqual(body, {
          foo: 'bar'
        })
      );

    async.series(
      [
        cb =>
          request
            .post('/foo')
            .send({ foo: 'bar' })
            .end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb =>
          request
            .post('/foo')
            .send({ some: 'value' })
            .end(cb),
        cb => {
          expect(expectation.verify).to.throw('Body did not match expectation callback');
          cb();
        }
      ],
      done
    );
  });

  it('should implement header() expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .header('host', 'example.com');

    async.series(
      [
        cb =>
          request
            .get('/foo')
            .set('HOST', 'example.com')
            .end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb =>
          request
            .get('/foo')
            .set('HOST', 'unknown.com')
            .end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Header "host: example.com" expected, but got "unknown.com"'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should implement header() function expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .header('host', value => value === 'example.com');

    async.series(
      [
        cb =>
          request
            .get('/foo')
            .set('HOST', 'example.com')
            .end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb =>
          request
            .get('/foo')
            .set('HOST', 'unknown.com')
            .end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Header "host: unknown.com" did not match expectation callback'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should support expectation callback', done => {
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
        expectation.verify(done);
      });
  });

  it('should support expectation callback with error', done => {
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

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.exist;
        done();
      });
    });
  });

  it('should handle custom error in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(params => {
        expect(params).to.equal({
          id: '9999'
        });
      })
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        try {
          expect(err.message).to.equal(
            "[post] /foo -- Params did not match expectation callback: expected { id: '9999' } to equal { id: '9999' }"
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });

  it('should render custom error in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(() => {
        throw new Error('my custom assertion error');
      })
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Params did not match expectation callback: my custom assertion error'
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });

  it('should not render custom error if null in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(() => {
        // eslint-disable-next-line no-throw-literal
        throw null;
      })
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        try {
          expect(err.message).to.equal('[post] /foo -- Params did not match expectation callback');
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });

  it('should not render custom error if no message in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(() => {
        // eslint-disable-next-line no-throw-literal
        throw {};
      })
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        try {
          expect(err.message).to.equal('[post] /foo -- Params did not match expectation callback');
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });

  it('should allow composable expectations', done => {
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
        expectation.verify(done);
      });
  });

  it('should support query alias to params for expectations', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .header('host', 'example.com')
      .query({
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
        expectation.verify(done);
      });
  });
});
