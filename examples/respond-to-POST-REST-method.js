const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

mockyeah.post('/', (req, res) => {
  res.send(req.body.hey);
});

const postData = JSON.stringify({
  hey: 'it worked!'
});

const request = http.request({
  hostname: 'localhost',
  port: 4001,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  log(res);
  mockyeah.close();
});

request.write(postData);
request.end();
