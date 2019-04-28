import '@babel/polyfill';
import 'whatwg-fetch';
import proxy from 'mockyeah-fetch/proxy'
import fetches from './fetches'

proxy({
  serverUrl: 'http://localhost:4001',
  suiteHeader: 'x-mockyeah-suite',
  suiteCookie: 'mockyeahSuite'
})

fetches()
