'use strict';

const supertest = require('supertest');
const async = require('async');
const { expect } = require('chai');
const assert = require('assert');
const MockYeahServer = require('../../server');

describe('Route expectation', () => {
  let mockyeah;
  let request;

  before(() => {
    mockyeah = MockYeahServer({ port: 0, adminPort: 0 });
    request = supertest(mockyeah.server);
  });

  afterEach(() => mockyeah.reset());

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

  it('should support expect with auto-mount', done => {
    const expectation = mockyeah
      .expect({
        path: '/foo'
      })
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

  it('should support expect with auto-mount and redundant assertions', done => {
    const expectation = mockyeah
      .expect({
        path: '/foo',
        query: {
          some: 'value'
        }
      })
      .query({
        some: 'value'
      })
      .once();

    async.series(
      [
        cb => {
          expect(expectation.verify).to.throw(
            'Expected route to be called once, but it was called 0 times'
          );
          cb();
        },
        cb => request.get('/foo?some=value').end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb => request.get('/foo?some=value').end(cb),
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

  it('should fail for expect with auto-mount not matching', done => {
    const expectation = mockyeah.expect({
      path: '/faoo',
      query: {
        some: 'value'
      }
    });

    async.series(
      [
        cb => request.get('/foo?some=nope').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expect object did not match: Expected `"value"` and value `"nope"` not equal for "query.some". Value `"/foo"` does not pass function (`"/faoo"`) for "url"'
          );
          cb();
        }
      ],
      done
    );
  });

  it('should fail for expect with auto-mount not matching with regex', done => {
    const expectation = mockyeah.expect({
      path: /faoo/,
      query: {
        some: 'value'
      }
    });

    async.series(
      [
        cb => request.get('/foo?some=nope').end(cb),
        cb => {
          expect(expectation.verify).to.throw(
            'Expect object did not match: Expected `"value"` and value `"nope"` not equal for "query.some". Value `"/foo"` does not pass function (`/faoo/`) for "url"'
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

  it('should implement path() expectation', done => {
    const expectation = mockyeah
      .get('*')
      .expect()
      .path(/foo/);

    async.series(
      [
        cb => request.get('/foo').end(cb),
        cb => {
          expectation.verify();
          cb();
        }
      ],
      done
    );
  });

  it('should implement url() expectation', done => {
    const expectation = mockyeah
      .get('*')
      .expect()
      .url(/foo/);

    async.series(
      [
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

  it('should implement params() expectation with number', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: 9999
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

  it('should implement params() expectation with nested regex', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: /99/
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
        assert.deepStrictEqual(params, {
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
          expect(expectation.verify).to.throw('Params did not match expected');
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

  it('should implement body() regex expectation', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .body({
        foo: /ar/
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
        assert.deepStrictEqual(body, {
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
          expect(expectation.verify).to.throw('Body did not match expected');
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
      .header('X-TEST', 'myTest');

    async.series(
      [
        cb =>
          request
            .get('/foo')
            .set('X-TEST', 'myTest')
            .end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb =>
          request
            .get('/foo')
            .set('X-TEST', 'otherTest')
            .end(cb),
        cb => {
          expect(expectation.verify).to.throw('Header "X-TEST" did not match expected');
          cb();
        }
      ],
      done
    );
  });

  it('should implement header() regex expectation', done => {
    const expectation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .header('x-test', /yT/);

    async.series(
      [
        cb =>
          request
            .get('/foo')
            .set('x-test', 'myTest')
            .end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb =>
          request
            .get('/foo')
            .set('x-test', 'otherTest')
            .end(cb),
        cb => {
          expect(expectation.verify).to.throw('Header "x-test" did not match expected');
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
      .header('x-test', value => value === 'myTest');

    async.series(
      [
        cb =>
          request
            .get('/foo')
            .set('X-TEST', 'myTest')
            .end(cb),
        cb => {
          expectation.verify();
          cb();
        },
        cb =>
          request
            .get('/foo')
            .set('X-TEST', 'otherTest')
            .end(cb),
        cb => {
          expect(expectation.verify).to.throw('Header "x-test" did not match expected');
          cb();
        }
      ],
      done
    );
  });

  it('should support run callback', done => {
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(cb => {
        request.get('/foo?id=9999').end(cb);
      })
      .verify(done);
  });

  it('should support run then promise', () =>
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(() => request.get('/foo?id=9999'))
      .verify());

  it('should support run callback with error', done => {
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(cb => cb(new Error('failure in run callback')))
      .verify(err => {
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal('failure in run callback');
          done();
        } catch (err2) {
          done(err2);
        }
      });
  });

  it('should support run callback then promise with error', done => {
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(cb => cb(new Error('failure in run callback')))
      .verify()
      .then(() => {
        done(new Error('expected error'));
      })
      .catch(err => {
        try {
          expect(err.message).to.equal('failure in run callback');
          done();
        } catch (err2) {
          done(err2);
        }
      });
  });

  it('should support run callback with expectation error', done => {
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '123'
      })
      .once()
      .run(cb => {
        request.get('/foo?id=9999').end(cb);
      })
      .verify(err => {
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal(
            '[get] /foo -- Params did not match expected: Expected `"123"` and value `"9999"` not equal for "id"'
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
  });

  it('should support run promise', done => {
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(
        new Promise((resolve, reject) => {
          request.get('/foo?id=9999').end((err, res) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(res);
          });
        })
      )
      .verify(done);
  });

  it('should support run promise then promise', () =>
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(
        new Promise((resolve, reject) => {
          request.get('/foo?id=9999').end((err, res) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(res);
          });
        })
      )
      .verify());

  it('should support run callback returning promise', done => {
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(
        () =>
          new Promise((resolve, reject) => {
            request.get('/foo?id=9999').end((err, res) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          })
      )
      .verify(done);
  });

  it('should support run callback returning promise then promise', () =>
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(
        () =>
          new Promise((resolve, reject) => {
            request.get('/foo?id=9999').end((err, res) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          })
      )
      .verify());

  it('should support run callback returning promise with error', done => {
    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(
        () =>
          new Promise((resolve, reject) => {
            reject(new Error('failure in run promise'));
          })
      )
      .verify(err => {
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal('failure in run promise');
          done();
        } catch (err2) {
          done(err2);
        }
      });
  });

  it('should support run callback returning promise with uncaught error', done => {
    process.once('unhandledRejection', err => {
      try {
        expect(err.message).to.equal('failure in run promise');
        done();
      } catch (err2) {
        done(err2);
      }
    });

    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(
        () =>
          new Promise((resolve, reject) => {
            reject(new Error('failure in run promise'));
          })
      );
  });

  it('should support run promise', done => {
    const promise = new Promise((resolve, reject) => {
      request.get('/foo?id=9999').end((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });

    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(promise)
      .verify(done);
  });

  it('should support run promise with error', done => {
    const promise = new Promise((resolve, reject) => {
      reject(new Error('failure in run promise'));
    });

    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(promise)
      .verify(err => {
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal('failure in run promise');
          done();
        } catch (err2) {
          done(err2);
        }
      });
  });

  it('should support run promise with error and no done', done => {
    const promise = new Promise((resolve, reject) => {
      reject(new Error('failure in run promise'));
    });

    const expecation = mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .once()
      .run(promise);

    // eslint-disable-next-line no-underscore-dangle
    expecation
      .verify()
      .then(() => {
        done(new Error('expected error'));
      })
      .catch(() => {
        done();
      });
  });

  it('should support run promise with expectation error', done => {
    const promise = new Promise((resolve, reject) => {
      request.get('/foo?id=9999').end((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });

    mockyeah
      .get('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '123'
      })
      .once()
      .run(promise)
      .verify(err => {
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal(
            '[get] /foo -- Params did not match expected: Expected `"123"` and value `"9999"` not equal for "id"'
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
  });

  it('should support expectation verifier callback', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .header('x-test', 'myTest')
      .params({
        id: '9999'
      })
      .body({
        foo: 'bar'
      })
      .once();

    request
      .post('/foo?id=9999')
      .set('X-Test', 'myTest')
      .send({ foo: 'bar' })
      .end(expectation.verifier(done));
  });

  it('should support expectation verifier callback with verify error', done => {
    const wrappedDone = err => {
      expect(err).to.exist;
      expect(err.message).to.match(/\[post\] \/foo -- Header "x-test" did not match expected/);
      done();
    };

    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .header('x-test', 'myTest')
      .params({
        id: '9999'
      })
      .body({
        foo: 'bar'
      })
      .once();

    request.post('/foo?id=9999').end(expectation.verifier(wrappedDone));
  });

  it('should support expectation verifier callback with verify error', done => {
    const wrappedDone = err => {
      expect(err).to.exist;
      expect(err.message).to.match(/\[post\] \/foo -- Header "x-test" did not match expected/);
      done();
    };

    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .header('x-test', 'myTest')
      .params({
        id: '9999'
      })
      .body({
        foo: 'bar'
      })
      .once();

    request.post('/foo?id=8888').end(expectation.verifier(wrappedDone));
  });

  it('should support expectation verifier callback with request error', done => {
    const wrappedDone = err => {
      expect(err).to.exist;
      expect(err.message).to.match(/request error/);
      done();
    };

    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params({
        id: '9999'
      })
      .body({
        foo: 'bar'
      })
      .once();

    const verifier = expectation.verifier(wrappedDone);

    verifier(new Error('request error'));
  });

  it('should handle custom error in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(params => {
        expect(params).to.deep.equal({
          id: '1234'
        });
      })
      .once();

    request.post('/foo?id=9999').end(err => {
      if (err) {
        done(err);
        return;
      }

      expectation.verify(err2 => {
        if (!err2) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err2.message).to.equal(
            "[post] /foo -- Params did not match expected: expected { id: '9999' } to deeply equal { id: '1234' }"
          );
          done();
        } catch (err3) {
          done(err3);
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
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Params did not match expected: my custom assertion error'
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });

  it('should not render custom error if undefined in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(() => {
        // eslint-disable-next-line no-throw-literal
        throw undefined;
      })
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Params did not match expected: Threw error without message `undefined`'
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
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Params did not match expected: Threw error without message `null`'
          );
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
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Params did not match expected: Threw error without message `{}`'
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });

  it('should handle return true in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(params => params.id === '9999')
      .once();

    request.post('/foo?id=9999').end(expectation.verifier(done));
  });

  it('should handle return false in expectation functions', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .params(params => params.id === '1234')
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        if (!err) {
          done(new Error('expected error'));
          return;
        }
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Params did not match expected: Value `{"id":"9999"}` does not pass function'
          );
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
      .header('x-test', 'myTest')
      .params({
        id: '9999'
      })
      .body({
        foo: 'bar'
      })
      .once();

    request
      .post('/foo?id=9999')
      .set('x-test', 'myTest')
      .send({ foo: 'bar' })
      .end(expectation.verifier(done));
  });

  it('should support query alias to params for expectations', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect()
      .query({
        id: '9999'
      })
      .body({
        foo: 'bar'
      })
      .once();

    request
      .post('/foo?id=9999')
      .send({ foo: 'bar' })
      .end(expectation.verifier(done));
  });

  it('should support custom generic expect object', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect({
        method: 'post',
        path: '/foo',
        query: {
          id: /99/,
          int: 3
        },
        headers: value => value['x-test'].includes('Tes'),
        body: {
          foo: 'bar'
        }
      })
      .once();

    request
      .post('/foo?id=9999&int=3')
      .set('X-TEST', 'myTest')
      .send({ foo: 'bar' })
      .end(expectation.verifier(done));
  });

  it('should support custom generic expect function', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect(data => {
        expect(data.headers).to.be.object;
        expect(data.query).to.be.object;
        expect(data.body).to.be.object;

        expect(data.method).to.equal('post');
        expect(data.path).to.equal('/foo');
        expect(data.query.id).to.equal('9999');
        expect(data.headers['x-test']).to.equal('myTest');
        expect(data.body.foo).to.equal('bar');
      })
      .once();

    request
      .post('/foo?id=9999')
      .set('X-TEST', 'myTest')
      .send({ foo: 'bar' })
      .end(expectation.verifier(done));
  });

  it('should support custom generic expect function returning true', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect(data => data.path === '/foo')
      .once();

    request
      .post('/foo?id=9999')
      .send({ foo: 'bar' })
      .end(expectation.verifier(done));
  });

  it('should render custom error in expect functions returning false', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect(data => data.path === '/what')
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Expect function did not match: function returned false'
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });

  it('should render custom error in expect functions with error', done => {
    const expectation = mockyeah
      .post('/foo', { text: 'bar' })
      .expect(() => {
        throw new Error('my custom assertion error');
      })
      .once();

    request.post('/foo?id=9999').end(() => {
      expectation.verify(err => {
        try {
          expect(err.message).to.equal(
            '[post] /foo -- Expect function did not match: my custom assertion error'
          );
          done();
        } catch (err2) {
          done(err2);
        }
      });
    });
  });
});
