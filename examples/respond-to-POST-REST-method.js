const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.post('/', { text: 'it worked!' });

http.get({
  hostname: 'localhost',
  port: 4001,
  path: '/',
  method: 'POST'
}, (res) => {
  log(res);
  mockyeah.close();
});
