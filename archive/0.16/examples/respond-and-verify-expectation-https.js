const https = require('https');
const log = require('./log');
const mockyeah = require('./mockyeah-https');

const expectation = mockyeah
  .get('/', { text: 'it worked!' })
  .expect()
  .header('host', 'example.com')
  .params({
    foo: 'bar'
  })
  .body('{ "some": "data" }')
  .once();

https.get('https://localhost:4443', res => {
  try {
    expectation.verify();
  } catch (err) {
    console.log(err);
  }
  log(res);
  mockyeah.close();
});
