const MockyeahServer = require('mockyeah/server');

const mockyeah = new MockyeahServer({
  port: 0,
  adminServer: false,
  start: false,
  watch: false
});

beforeAll(() => mockyeah.start());

afterEach(() => mockyeah.reset());

afterAll(() => mockyeah.close());

module.exports = mockyeah;
