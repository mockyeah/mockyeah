'use strict';

require('../TestHelper');
const MockYeahServer = require('../../server');

describe('close() promise', () => {
  it('should use a promise', done => {
    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0 });
    mockyeah.close().then(done).catch(done);
  })

  it('should use a promise even when given a callback', done => {
    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0 });
    mockyeah.close(() => { }).then(done).catch(done);
  })
});
