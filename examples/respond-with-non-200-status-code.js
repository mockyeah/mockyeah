const http = require('http');
const mockyeah = require('./mockyeah');

mockyeah.get('/', { text: 'bummer.', status: 500 });

http.get('http://localhost:4001', (res) => {
  console.log('received status ' + res.statusCode);
  res.on('data', (chunk) => console.log(chunk.toString()));
  mockyeah.close();
});
