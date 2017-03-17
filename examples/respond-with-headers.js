const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { headers: { foo: 'bar' } });

http.get('http://localhost:4001', (res) => {
  log(res);
  mockyeah.close();
});
