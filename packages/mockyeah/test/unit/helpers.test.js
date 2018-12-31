'use strict';

const { expect } = require('chai');

const { handleContentType } = require('../../app/lib/helpers');

describe('app helpers', () => {
  describe('handleContentType', () => {
    it('gives raw with no content-type header', () => {
      const body = 'some body';
      const headers = {};
      expect(handleContentType(body, headers)).to.deep.equal({
        raw: body
      });
    });

    it('gives raw with text content-type', () => {
      const body = 'some body';
      const headers = {
        'content-type': 'text/plain'
      };
      expect(handleContentType(body, headers)).to.deep.equal({
        raw: body
      });
    });

    it('gives json with json content-type', () => {
      const body = '{"foo":"bar"}';
      const headers = {
        'content-type': 'application/json'
      };
      expect(handleContentType(body, headers)).to.deep.equal({
        json: {
          foo: 'bar'
        }
      });
    });
  });
});
