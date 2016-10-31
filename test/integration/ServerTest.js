'use strict';

const TestHelper = require('../TestHelper');
const request = TestHelper.request;
const mockyeah = TestHelper.mockyeah;

describe('Server', () => {
    it('should respond to root http requests', (done) => {
        request
            .get('/')
            .expect(200, /Hello\, mockyeah\!/, done);
    });

    it('should respond with a 404 for unknown paths', (done) => {
        request.get('/unknown/path').expect(404, done);
    });

    it('should set a definition', (done) => {
        mockyeah.get('/test', {text: "someValue", status: 401});
        request
            .get('/test')
            .expect(401, "someValue", done);
    });

    it('should overwrite an existing definition', (done) => {
        mockyeah.get('/test', {text: "someValue", status: 401});
        request
            .get('/test').then(() => {
                mockyeah.get('/test', {text: "someOtherValue", status: 200});
                request
                    .get('/test')
                    .expect(200, "someOtherValue", done);
            });
    });
});