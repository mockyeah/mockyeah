'use strict';

const TestHelper = require('../TestHelper');
const mockyeah = TestHelper.mockyeah;
const request = TestHelper.request;
const async = require('async');
const expect = require('chai').expect;

describe('Fixture Play', function() {
  it('should play a custom fixture', function(done) {
    mockyeah.play('some-custom-fixtures');

    /**
     * Make many requests in series, waits to execute `done`
     * until all complete.
     */
    async.series([
      (cb) => request.get('/say-hello').expect(200, /hello there/, cb),
      (cb) => request.get('/say-oh-noes').expect(500, /Oh noes/, cb),
      (cb) => request.get('/say-your-lost').expect(404, /I\'m lost/, cb),
      (cb) => request.get('/respond-with-a-file').expect(200, /Hugo/, cb),
      (cb) => request.get('/respond-with-a-fixture').expect(200, /Desmond/, cb),
      (cb) => {
        const latency = 1000;
        const threshold = latency + 100;
        const start = (new Date).getTime();

        request
          .get('/wait-to-respond')
          .expect(200, /Oh\, hey there/, done)
          .expect(() => {
            const now = (new Date).getTime();
            const duration = now - start;
            expect(duration).to.be.within(latency, threshold);
          }, cb);
      }
    ], done);
  });
});