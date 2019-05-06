const MockyeahServer = require('mockyeah/server');

const mockyeah = new MockyeahServer({
  port: 0,
  adminServer: false,
  start: false,
  watch: false
});

before(() => mockyeah.start());

afterEach(() => mockyeah.reset());

after(() => mockyeah.close());

module.exports = mockyeah;
