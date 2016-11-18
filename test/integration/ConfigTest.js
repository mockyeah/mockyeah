'use strict';

const exec = require('child_process').exec;
const expect = require('chai').expect;

describe('Config', () => {
  it('should write output to stdout by default', function(done) {
    exec(`echo "
      const mockyeah = new require('./server')({ port: 0 }, function() { process.exit() });
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.include('mockyeah');
      done();
    });
  });

  it('should write output to stdout when enabled', function(done) {
    exec(`echo "
      const mockyeah = new require('./server')({ port: 0, output: true }, function() { process.exit() });
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.include('mockyeah');
      done();
    });
  });

  it('should not write to stdout when disabled', function(done) {
    exec(`echo "
      const mockyeah = new require('./server')({ port: 0, output: false }, function() { process.exit() });
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.not.include('mockyeah');
      done();
    });
  });

  it('should not write verbose output to stdout by default', function(done) {
    exec(`echo "
      const request = require('supertest');
      const mockyeah = new require('./server')({ port: 0 });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
      .get('/foo?bar=true')
      .expect(200, /bar/, process.exit);
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.not.include('verbose output enabled');
      done();
    });
  });

  it('should  write verbose output to stdout when enabled', function(done) {
    exec(`echo "
      const request = require('supertest');
      const mockyeah = new require('./server')({ port: 0, verbose: true });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
      .get('/foo?bar=true')
      .expect(200, /bar/, process.exit);
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.include('verbose output enabled');
      done();
    });
  });

  it('should not write verbose output to stdout when disabled', function(done) {
    exec(`echo "
      const request = require('supertest');
      // const mockyeah = new require('./server')({ port: 0, verbose: false });
      const mockyeah = require('./index');
      setTimeout(function() {
        mockyeah.get('/foo', { text: 'bar' });
        request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      }, 1000);
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.not.include('verbose output enabled');
      done();
    });
  });

  it('should not write journaled output to stdout by default', function(done) {
    exec(`echo "
      const request = require('supertest');
      const mockyeah = new require('./server')({ port: 0 });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.not.include('JOURNAL');
      done();
    });
  });

  it('should write journaled output to stdout when enabled', function(done) {
    exec(`echo "
      const request = require('supertest');
      const mockyeah = new require('./server')({ port: 0, journal: true });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.include('JOURNAL');
      done();
    });
  });

  it('should not write journaled output to stdout when disabled ', function(done) {
    exec(`echo "
      const request = require('supertest');
      const mockyeah = new require('./server')({ port: 0, journal: false });
      mockyeah.get('/foo', { text: 'bar' });
      request(mockyeah.server)
        .get('/foo?bar=true')
        .expect(200, /bar/, process.exit);
      " | node`, function(err, stdout, stderr) {
      expect(stdout).to.not.include('JOURNAL');
      done();
    });
  });
});
