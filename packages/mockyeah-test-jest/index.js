const MockyeahServer = require('mockyeah/server');

const mockyeah = new MockyeahServer({
  port: 0,
  adminServer: false,
  start: false,
  watch: false,
  output: false
});

beforeAll(() => mockyeah.start());

afterEach(() => mockyeah.reset());

afterAll(() => mockyeah.shutdown());

module.exports = mockyeah;
