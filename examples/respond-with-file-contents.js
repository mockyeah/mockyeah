const http = require('http');
const path = require('path');
const log = require('./log');
const mockyeah = require('./mockyeah');
const filePath = path.join(__dirname, 'fixtures/example.txt');

mockyeah.get('/', { filePath });

http.get('http://localhost:4001', (res) => {
  log(res);
  mockyeah.close();
});
