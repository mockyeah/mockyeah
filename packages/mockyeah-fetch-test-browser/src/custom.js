import '@babel/polyfill';
// import 'whatwg-fetch';
import Mockyeah from 'mockyeah-fetch';
import fetches from './fetches';

Mockyeah({
  host: 'localhost',
  port: 4001,
  suiteHeader: 'x-mockyeah-suite',
  suiteCookie: 'mockyeahSuite'
});

fetches();
