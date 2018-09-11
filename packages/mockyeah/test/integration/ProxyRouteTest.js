'use strict';

const { expect } = require('chai');
require('../TestHelper');
const { makeRequestUrl } = require('../../app/proxyRoute');

describe('proxyRoute', () => {
  describe('makeRequestUrl', () => {
    it('should decode protocol', () => {
      expect(
        makeRequestUrl({
          originalUrl: 'http%3A%2F%2Fexample.com?otherUrl=http%3A%2F%2Ffoo.com'
        })
      ).to.equal('http://example.com?otherUrl=http%3A%2F%2Ffoo.com');
    });
  });
});
