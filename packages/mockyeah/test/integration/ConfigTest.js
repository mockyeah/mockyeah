'use strict';

/* eslint-disable prefer-arrow-callback */

const { exec } = require('child_process');
const { expect } = require('chai');

const ROOT = `${__dirname}/../..`;

describe('Config', () => {
  it('should work without config', function(done) {
    exec(
      `echo "
      global.MOCKYEAH_ROOT = '~';
      const mockyeah = require('${ROOT}/index');
      setTimeout(() => {
        process.exit();
      }, 1000)
      " | node`,
      function(err, stdout) {
        expect(stdout).to.include('mockyeah');
        done();
      }
    );
  });

  it('should write output to stdout by default', function(done) {
    exec(
      `echo "
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0 }, function() { process.exit() });
      " | node`,
      function(err, stdout) {
        expect(stdout).to.include('mockyeah');
        done();
      }
    );
  });

  it('should write output to stdout when enabled', function(done) {
    exec(
      `echo "
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0, output: true }, function() { process.exit() });
      " | node`,
      function(err, stdout) {
        expect(stdout).to.include('mockyeah');
        done();
      }
    );
  });

  it('should not write to stdout when disabled', function(done) {
    exec(
      `echo "
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0, output: false }, function() { process.exit() });
      " | node`,
      function(err, stdout) {
        expect(stdout).to.not.include('mockyeah');
        done();
      }
    );
  });

  it('should not write verbose output to stdout by default', function(done) {
    exec(
      `echo "
      const request = require('supertest');
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0 });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
      .get('/foo?bar=true')
      .expect(200, /bar/, process.exit);
      " | node`,
      function(err, stdout) {
        expect(stdout).to.not.include('verbose output enabled');
        done();
      }
    );
  });

  it('should write verbose output to stdout when enabled', function(done) {
    exec(
      `echo "
      const request = require('supertest');
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0, verbose: true });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
      .get('/foo?bar=true')
      .expect(200, /bar/, process.exit);
      " | node`,
      function(err, stdout) {
        expect(stdout).to.include('verbose output enabled');
        done();
      }
    );
  });

  it('should not write verbose output to stdout when disabled', function(done) {
    exec(
      `echo "
      const request = require('supertest');
      const mockyeah = require('${ROOT}/index');
      setTimeout(function() {
        mockyeah.get('/foo', { text: 'bar' });
        request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      }, 1000);
      " | node`,
      function(err, stdout) {
        expect(stdout).to.not.include('verbose output enabled');
        done();
      }
    );
  });

  it('should not write journaled output to stdout by default', function(done) {
    exec(
      `echo "
      const request = require('supertest');
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0 });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      " | node`,
      function(err, stdout) {
        expect(stdout).to.not.include('journal');
        done();
      }
    );
  });

  it('should write journaled output to stdout when enabled', function(done) {
    exec(
      `echo "
      const request = require('supertest');
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0, journal: true });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      " | node`,
      function(err, stdout) {
        expect(stdout).to.include('journal');
        done();
      }
    );
  });

  it('should not write journaled output to stdout when disabled ', function(done) {
    exec(
      `echo "
      const request = require('supertest');
      const mockyeah = new require('${ROOT}/server')({ port: 0, adminPort: 0, journal: false });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      " | node`,
      function(err, stdout) {
        expect(stdout).to.not.include('journal');
        done();
      }
    );
  });
});
