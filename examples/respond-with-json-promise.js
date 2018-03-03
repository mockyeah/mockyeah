const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', {
  json: Promise.resolve({ hey: 'it worked!' })
});

http.get('http://localhost:4001?ok=yes', res => {
  log(res);
  mockyeah.close();
});
