const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.delete('/', { text: 'it worked!' });

http.get({
  hostname: 'localhost',
  port: 4001,
  path: '/',
  method: 'DELETE'
}, (res) => {
  log(res);
  mockyeah.close();
});
