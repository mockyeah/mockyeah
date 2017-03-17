const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { fixture: 'example.json' });

http.get('http://localhost:4001', (res) => {
  log(res);
  mockyeah.close();
});
