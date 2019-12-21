'use strict';

const { expect } = require('chai');
const MockYeahServer = require('../../server');

/**
 * Instantiate new mockyeah server so that `TestHelper.mockyeah`
 * is not affected with middleware.
 */

it('server should start when method called, and call callback', done => {
  const mockyeah = new MockYeahServer({
    port: 0,
    adminPort: 0,
    start: false
  });

  mockyeah.start(() => {
    expect(mockyeah.server).to.exist;
    expect(mockyeah.server.url).to.exist;
    mockyeah.close(done);
  });
});

it('server should start when method called, and return promise', () => {
  const mockyeah = new MockYeahServer({
    port: 0,
    adminPort: 0,
    start: false
  });

  return mockyeah.start().then(() => {
    expect(mockyeah.server).to.exist;
    expect(mockyeah.server.url).to.exist;
    return mockyeah.close();
  });
});
