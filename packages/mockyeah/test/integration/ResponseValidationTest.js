'use strict';

const { expect } = require('chai');
const TestHelper = require('../TestHelper');

const { mockyeah, request } = TestHelper;

describe('Response Validation', () => {
  it('should support string response options', done => {
    mockyeah.get('/some/service/end/point', 'hey there');

    request.get('/some/service/end/point').expect(200, 'hey there', done);
  });

  it('should validate response option(s) are correct', done => {
    try {
      // Use incorrect option 'file'
      mockyeah.get('/some/service/end/point', { file: './fixtures/some-data.json' });
    } catch (err) {
      expect(err.message).to.equal(
        'Response option(s) invalid. Options must include one of the following: fixture, filePath, html, json, text, status, headers, raw, latency, type'
      );
      done();
    }

    request.get('/some/service/end/point').expect(404);
  });
});
