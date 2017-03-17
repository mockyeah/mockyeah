const http = require('http');
const path = require('path');
const mockyeah = require('./mockyeah');
const filePath = path.join(__dirname, 'fixtures/example.txt');

mockyeah.get('/', { filePath });

http.get('http://localhost:4001', (res) => {
  res.on('data', (chunk) => console.log(chunk.toString()));
  mockyeah.close();
});
