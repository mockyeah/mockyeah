const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.all('/', { text: 'it worked!' });

const options = {
  hostname: 'localhost',
  port: 4001,
  path: '/'
};

http.get(Object.assign(options, { method: 'GET' }), (res) => {
  log(res);
});

http.get(Object.assign(options, { method: 'POST' }), (res) => {
  log(res);
});

http.get(Object.assign(options, { method: 'PUT' }), (res) => {
  log(res);
});

http.get(Object.assign(options, { method: 'DELETE' }), (res) => {
  log(res);
  mockyeah.close();
});
