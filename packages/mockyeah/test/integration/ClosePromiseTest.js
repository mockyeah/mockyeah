'use strict';

require('../TestHelper');
const MockYeahServer = require('../../server');

describe('close() promise', () => {
  it('should use a promise', () => {
    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0 });
    return mockyeah.close()
  })

  it('should use a promise even when given a callback', () => {
    const mockyeah = new MockYeahServer({ port: 0, adminPort: 0 });
    return mockyeah.close(() => { })
  })
});
