const http = require('http');
const log = require('./log');
const mockyeah = require('./mockyeah');

const expectation = mockyeah
  .get('/', { text: 'it worked!' })
  .expect()
  .header('host', 'example.com')
  .params({
    foo: 'bar'
  })
  .body('{ "some": "data" }')
  .once();

http.get('http://localhost:4001', (res) => {
  try {
    expectation.verify();
  } catch (err) {
    console.log(err);
  }
  log(res);
  mockyeah.close();
});
