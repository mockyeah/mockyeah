require('isomorphic-fetch');
const Mockyeah = require('@mockyeah/fetch');

const mockyeah = new Mockyeah();

afterEach(() => mockyeah.reset());

module.exports = mockyeah;
