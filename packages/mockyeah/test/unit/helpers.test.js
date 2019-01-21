'use strict';

const { expect } = require('chai');

const {
  compileRoute,
  handleContentType,
  handlePathTypes,
  replaceFixtureWithRequireInJson,
  getDataForRecordToFixtures
} = require('../../app/lib/helpers');

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

  describe('compileRoute', () => {
    it('works for strings', () => {
      const app = {};
      const match = '/';
      expect(compileRoute(app, match).path).to.equal('/');
    });

    it('works for objects without method', () => {
      const app = {};
      const match = {
        path: '/'
      };
      expect(compileRoute(app, match).path).to.equal('/');
    });

    it('works for objects with method', () => {
      const app = {};
      const match = {
        method: 'post',
        path: '/'
      };
      expect(compileRoute(app, match).method).to.equal('post');
      expect(compileRoute(app, match).path).to.equal('/');
    });
  });

  describe('handlePathTypes', () => {
    it('throws for unknown type', () => {
      expect(handlePathTypes.bind(1)).to.throw();
    });
  });

  describe('replaceFixtureWithRequireInJson', () => {
    it('replaces fixture as JSON file', () => {
      const fixturePath = 'foo/1.json';
      const json = `{
        "fixture": "${fixturePath}"
      }`;
      const relativePath = '/my/path';
      const result = replaceFixtureWithRequireInJson(json, {
        relativePath
      });
      expect(result).to.equal(`{
        "json": require("${relativePath}/${fixturePath}")
      }`);
    });
  });

  describe('getDataForRecordToFixtures', () => {
    it('raw body is extracted and fixture option added', () => {
      const raw = 'some raw response body';
      const responseOptions = {
        raw
      };
      const name = 'my-capture';
      const index = 0;
      const result = getDataForRecordToFixtures({ responseOptions, name, index });
      expect(result).to.deep.equal({
        newResponseOptions: {
          fixture: `${name}/${index}.txt`
        },
        body: raw
      });
    });

    it('JSON body is extracted and fixture option added', () => {
      const json = { foo: 'bar' };
      const responseOptions = {
        json
      };
      const name = 'my-capture';
      const index = 0;
      const result = getDataForRecordToFixtures({ responseOptions, name, index });
      expect(result).to.deep.equal({
        newResponseOptions: {
          fixture: `${name}/${index}.json`
        },
        body: '{\n  "foo": "bar"\n}'
      });
    });
  });
});
