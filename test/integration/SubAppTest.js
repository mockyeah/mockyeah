'use strict';

const express = require('express');
const supertest = require('supertest');
const TestHelper = require('../TestHelper');
const mockyeah = TestHelper.mockyeah;

describe('SubApp', () => {
  it('should mount at sub-path and respond to requests', done => {
    const app = express();

    app.use('/subapp', mockyeah);

    mockyeah.get('/foo', { text: 'bar', status: 200 });

    app.listen(4888);

    supertest('http://127.0.0.1:4888')
      .get('/subapp/foo')
      .expect(200, 'bar', done);
  });
});
