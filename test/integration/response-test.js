'use strict';

const TestHelper = require('../TestHelper');
const request = TestHelper.request;
const mockyeah = TestHelper.mockyeah;
const expect = require('chai').expect;

describe('Response', () => {
  afterEach(() => mockyeah.reset());

  it('should not allow for more than one response type', () => {
    const payloadKeys = ['fixture', 'filePath', 'html', 'json', 'text'];
    const optionSets = [
      {
        fixture: './test/fixtures/some-data.json',
        filePath: './test/fixtures/some-data.csv'
      },
      {
        fixture: './test/fixtures/some-data.json',
        filePath: './test/fixtures/some-data.csv',
        html: '<body></body>'
      },
      {
        fixture: './test/fixtures/some-data.json',
        filePath: './test/fixtures/some-data.csv',
        html: '<body></body>',
        json: '{"test": "json"}'
      },
      {
        fixture: './test/fixtures/some-data.json',
        filePath: './test/fixtures/some-data.csv',
        html: '<body></body>',
        json: '{"test": "json"}',
        text: 'test text'
      }
    ];

    optionSets.forEach(optionSet => {
      expect(() => {
        mockyeah.get('/service/end/point', optionSet);
      }).to.throw('Response options must not include more than one of the following: ' + payloadKeys.join(', '));
    });
  });

  describe('Status', () => {
    it('should return 404 for undeclared services', (done) => {
      request
        .get('/some/non/existent/service/end/point')
        .expect(404, done);
    });

    it('should return a default status code of 200', (done) => {
      mockyeah.get('/service/exists');

      request
        .get('/service/exists')
        .expect(200, done);
    });

    it('should support declarative status code 301', (done) => {
      mockyeah.get('/some/service/end/point', { status: 301 });

      request
        .get('/some/service/end/point')
        .expect(301, done);
    });

    it('should support declarative status code 500', (done) => {
      mockyeah.get('/some/service/end/point', { status: 500 });

      request
        .get('/some/service/end/point')
        .expect(500, done);
    });
  });

  describe('Sets', () => {
    it('should respond successfully', (done) => {
      mockyeah.loadSet('example');

      request
        .get('/say-hello')
        .expect(200, 'Well, hello there.', done);
    });

    it('should respond with a 404', (done) => {
      mockyeah.loadSet('example');

      request
        .get('/say-your-lost')
        .expect(404, 'I\'m lost.', done);
    });

    it('should respond with a 500', (done) => {
      mockyeah.loadSet('example');

      request
        .get('/say-oh-noes')
        .expect(500, 'Oh noes!', done);
    });

    it('should respond with a file', (done) => {
      mockyeah.loadSet('example');

      request
        .get('/respond-with-a-file')
        .expect(200, done);
    });

    it('should respond with a fixture', (done) => {
      mockyeah.loadSet('example');

      request
        .get('/respond-with-a-fixture')
        .expect(200, done);
    });

    it('should respond with latency', (done) => {
      const latency = 1000;
      const threshold = latency + 250;

      mockyeah.loadSet('example');

      const start = (new Date).getTime();

      request
        .get('/wait-to-respond')
        .expect(200, 'Oh, hey there.', done)
        .expect(() => {
          const now = (new Date).getTime();
          const duration = now - start;
          expect(duration).to.be.within(latency, threshold);
        }, done);
    });

    it('should respond with an anonymous function', (done) => {
      mockyeah.loadSet('example');

      request
        .get('/say-anything-you-want')
        .expect(200, 'Inversion of service control enables you to respond with whatever you want.', done);
    });
  });

  describe('File', () => {
    it('should respond with a CSV Content-Type for CSV files', (done) => {
      mockyeah.get('/service/exists', { filePath: './test/fixtures/some-data.csv' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/csv/)
        .expect(200, done);
    });

    it('should respond with a JSON Content-Type for JSON files', (done) => {
      mockyeah.get('/service/exists', { filePath: './test/fixtures/some-data.json' });

      request
        .get('/service/exists')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should respond with a text Content-Type for text files', (done) => {
      mockyeah.get('/service/exists', { filePath: './test/fixtures/some-data.txt' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/plain/)
        .expect(200, done);
    });

    it('should respond with a XML Content-Type for XML files', (done) => {
      mockyeah.get('/service/exists', { filePath: './test/fixtures/some-data.xml' });

      request
        .get('/service/exists')
        .expect('Content-Type', /application\/xml/)
        .expect(200, done);
    });

    it('should allow Content-Type override', (done) => {
      mockyeah.get('/service/exists', { filePath: './test/fixtures/some-data.json', type: 'text' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/plain/)
        .expect(200, done);
    });
  });

  describe('Fixture', () => {
    it('should respond with a CSV Content-Type for CSV fixtures', (done) => {
      mockyeah.get('/service/exists', { fixture: 'some-data.csv' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/csv/)
        .expect(200, done);
    });

    it('should respond with a JSON Content-Type for JSON fixtures', (done) => {
      mockyeah.get('/service/exists', { fixture: 'some-data.json' });

      request
        .get('/service/exists')
        .expect('Content-Type', /application\/json/)
        .expect(200, done);
    });

    it('should respond with a text Content-Type for text fixtures', (done) => {
      mockyeah.get('/service/exists', { fixture: 'some-data.txt' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/plain/)
        .expect(200, done);
    });

    it('should respond with a XML Content-Type for XML fixtures', (done) => {
      mockyeah.get('/service/exists', { fixture: 'some-data.xml' });

      request
        .get('/service/exists')
        .expect('Content-Type', /application\/xml/)
        .expect(200, done);
    });

    it('should allow Content-Type override', (done) => {
      mockyeah.get('/service/exists', { fixture: 'some-data.json', type: 'text' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/plain/)
        .expect(200, done);
    });
  });

  describe('Headers', () => {
    it('should support custom headers', (done) => {
      mockyeah.get('/some/service/end/point', { text: 'Hello.', headers: { 'Foo-Bar': 'abc' } });

      request
        .get('/some/service/end/point')
        .expect('Foo-Bar', 'abc')
        .expect(200, /Hello/, done);
    });
  });

  describe('HTML', () => {
    it('should respond HTML Content-Type for HTML', (done) => {
      mockyeah.get('/service/exists', { html: '<p>Hello</p>' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/html/)
        .expect(200, /Hello/, done);
    });

    it('should allow Content-Type override', (done) => {
      mockyeah.get('/service/exists', { html: '<p>Hello</p>', type: 'text' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/plain/)
        .expect(200, /Hello/, done);
    });
  });

  describe('JSON', () => {
    it('should respond with JSON Content-Type for JSON', (done) => {
      mockyeah.get('/service/exists', { json: { foo: 'bar' } });

      request
        .get('/service/exists')
        .expect('Content-Type', /application\/json/)
        .expect(200, { foo: 'bar' }, done);
    });

    it('should allow Content-Type override', (done) => {
      mockyeah.get('/service/exists', { json: { foo: 'bar' }, type: 'text' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/plain/)
        .expect(200, '{"foo":"bar"}', done);
    });
  });

  describe('Latency', () => {
    it('should respond with latency', (done) => {
      const latency = 1000;
      const threshold = latency + 100;

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

  describe('Text', () => {
    it('should respond with text Content-Type for text', (done) => {
      mockyeah.get('/service/exists', { text: 'Hello' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/plain/)
        .expect(200, 'Hello', done);
    });

    it('should allow Content-Type override', (done) => {
      mockyeah.get('/service/exists', { text: 'Hello', type: 'html' });

      request
        .get('/service/exists')
        .expect('Content-Type', /text\/html/)
        .expect(200, 'Hello', done);
    });
  });
});
