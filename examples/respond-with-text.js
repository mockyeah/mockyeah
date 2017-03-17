const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { text: 'it worked!' });

http.get('http://localhost:4001', (res) => {
  log(res);
  mockyeah.close();
});
