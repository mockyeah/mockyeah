require('isomorphic-fetch');
const Mockyeah = require('@mockyeah/fetch');

const mockyeah = new Mockyeah({
  noWebSocket: true
});

afterEach(() => mockyeah.reset());

module.exports = mockyeah;
