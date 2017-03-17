const http = require('http');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { fixture: 'example.json' });

http.get('http://localhost:4001', (res) => {
  res.on('data', (chunk) => console.log(chunk.toString()));
  mockyeah.close();
});
