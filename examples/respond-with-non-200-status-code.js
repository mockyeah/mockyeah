const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { text: 'bummer.', status: 500 });

http.get('http://localhost:4001', (res) => {
  log(res);
  mockyeah.close();
});
