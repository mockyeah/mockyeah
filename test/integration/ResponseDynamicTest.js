'use strict';

const { forEach } = require('lodash');
const TestHelper = require('../TestHelper');

const { mockyeah, request } = TestHelper;

const sets = {
  html: {
    data: '<p>Hello</p>',
    body: /Hello/,
    type: /text\/html/
  },
  json: {
    data: { foo: 'bar' },
    body: '{"foo":"bar"}',
    type: /application\/json/
  },
  text: {
    data: 'Hello',
    body: 'Hello',
    type: /text\/plain/
  }
};

describe('Response Dynamic', () => {
  forEach(sets, (set, label) => {
    describe(label, () => {
      it('should respond with content and type for function', done => {
        mockyeah.get('/service/exists', { [label]: () => set.data });

        request
          .get('/service/exists')
          .expect('Content-Type', set.type)
          .expect(200, set.body, done);
      });

      it('should allow Content-Type override for function', done => {
        mockyeah.get('/service/exists', { [label]: () => set.data, type: 'text' });

        request
          .get('/service/exists')
          .expect('Content-Type', /text\/plain/)
          .expect(200, set.body, done);
      });

      it('should respond with content and type for promise', done => {
        mockyeah.get('/service/exists', { [label]: Promise.resolve(set.data) });

        request
          .get('/service/exists')
          .expect('Content-Type', set.type)
          .expect(200, set.body, done);
      });

      it('should allow Content-Type override for promise', done => {
        mockyeah.get('/service/exists', { [label]: Promise.resolve(set.data), type: 'text' });

        request
          .get('/service/exists')
          .expect('Content-Type', /text\/plain/)
          .expect(200, set.body, done);
      });

      it('should respond with content and type for function returning promise', done => {
        mockyeah.get('/service/exists', { [label]: () => Promise.resolve(set.data) });

        request
          .get('/service/exists')
          .expect('Content-Type', set.type)
          .expect(200, set.body, done);
      });

      it('should allow Content-Type override for function returning promise', done => {
        mockyeah.get('/service/exists', { [label]: () => Promise.resolve(set.data), type: 'text' });

        request
          .get('/service/exists')
          .expect('Content-Type', /text\/plain/)
          .expect(200, set.body, done);
      });
    });
  });
});
