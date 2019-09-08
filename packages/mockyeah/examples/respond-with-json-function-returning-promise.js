const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', {
  json: req => Promise.resolve({ hey: 'it worked!', query: req.query })
});

http.get('http://localhost:4001', res => {
  log(res);
  mockyeah.close();
});
