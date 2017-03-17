const http = require('http');
const mockyeah = require('../');

mockyeah.get('/', { latency: 3000 });

http.get('http://localhost:4001', () => {
  console.log('it worked!');
  mockyeah.close();
});
