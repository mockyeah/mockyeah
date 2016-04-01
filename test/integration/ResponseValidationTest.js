'use strict';

const TestHelper = require('../TestHelper');
const mockyeah = TestHelper.mockyeah;
const request = TestHelper.request;
const chai = require('chai');
const expect = chai.expect;

describe('Response Validation', () => {
  it('should validate response option(s) are correct', done => {
    try {
      // Use incorrect option 'file'
      mockyeah.get('/some/service/end/point', { file: './fixtures/some-data.json' });
    } catch (err) {
      expect(err.message).to.equal('Response option(s) invalid. Options must include one of the following: fixture, filePath, html, json, text, status, headers, raw, latency, type');
      done();
    }

    request
      .get('/some/service/end/point')
      .expect(404);
  });
});
