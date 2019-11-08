const mockyeah = require('.');

describe('mockyeah', () => {
  it('should work', () =>
    mockyeah
      .get('/')
      .expect()
      .once()
      .run(fetch(mockyeah.server.url))
      .verify());
});
