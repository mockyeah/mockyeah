import '@babel/polyfill';
import 'whatwg-fetch';
import Mockyeah from 'mockyeah-fetch';
import fetches from './fetches';

const mockyeah = Mockyeah({
  proxy: true
});

mockyeah.mock('https://example.local', {
  json: { ok: true }
});

mockyeah.post(
  {
    url: 'https://example.local?ok=true',
    body: {
      up: 'yes'
    }
  },
  {
    json: () => ({ hello: 'there' })
  }
);

fetches();
