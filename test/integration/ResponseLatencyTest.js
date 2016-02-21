'use strict';

const TestHelper = require('../TestHelper');
const mockyeah = TestHelper.mockyeah;
const request = TestHelper.request;
const expect = require('chai').expect;

describe('Response Latency', () => {
  it('should respond with latency', (done) => {
    const latency = 1000;
    const threshold = latency + 200;

    mockyeah.get('/slow/service', { text: 'Hello', latency });

    const start = (new Date).getTime();

    request
      .get('/slow/service')
      .expect(200, 'Hello', done)
      .expect(() => {
        const now = (new Date).getTime();
        const duration = now - start;
        expect(duration).to.be.within(latency, threshold);
      }, done);
  });

  it('should respond with no latency', (done) => {
    const threshold = 25;

    mockyeah.get('/fast/service', { text: 'Hello' });

    const start = (new Date).getTime();

    request
      .get('/fast/service')
      .expect(200, 'Hello', done)
      .expect(() => {
        const now = (new Date).getTime();
        const duration = now - start;
        expect(duration).to.be.below(threshold);
      }, done);
  });
});