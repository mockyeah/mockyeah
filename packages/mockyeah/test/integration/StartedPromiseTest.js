'use strict';

const MockYeahServer = require('../../server');

describe('started promise', () => {
  it('should use a promise that resolves ', () => {
    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0 });

    return mockyeah.startedPromise;
  });

  it('should use a promise that rejects', done => {
    const mockyeah = new MockYeahServer({ port: 1, adminPort: 0 });

    mockyeah.startedPromise.then(() => done(new Error('should have thrown'))).catch(() => done());
  });
});
