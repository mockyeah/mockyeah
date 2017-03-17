const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { text: 'it worked, finally!', latency: 3000 });

http.get('http://localhost:4001', (res) => {
  log(res);
  mockyeah.close();
});
