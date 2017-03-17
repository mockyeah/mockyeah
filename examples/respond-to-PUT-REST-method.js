const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.put('/', { text: 'it worked!' });

http.get({
  hostname: 'localhost',
  port: 4001,
  path: '/',
  method: 'PUT'
}, (res) => {
  log(res);
  mockyeah.close();
});
