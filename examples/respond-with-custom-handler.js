const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.get('/', (req, res) => {
  res.send('I\'m an Express.js route! Customize to your heart\'s content.');
});

http.get('http://localhost:4001', (res) => {
  log(res);
  mockyeah.close();
});
