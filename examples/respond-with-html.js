const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { html: '<strong>it worked!</strong>' });

http.get('http://localhost:4001', res => {
  log(res);
  mockyeah.close();
});
