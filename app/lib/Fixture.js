'use strict';

/* eslint-disable no-process-exit, no-sync */

/**
 * RouteRecorder
 *  Configures Mock Yeah to proxy and record http traffic.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const request = require('request');
const tildify = require('tildify');

function Fixture(app, fixtureName) {
  assert(app, 'App instance required');
  assert(fixtureName, 'Fixture name required');

  this.app = app;
  this.fixturePath = path.resolve(app.config.fixturesDir, fixtureName);

  return this;
};

Fixture.prototype._initFixture = function _initFixture() {
  this.count = 0;
  this.recording = true;

  mkdirp.sync(this.fixturePath);

  this.app.log(['record', 'fixture'], tildify(this.fixturePath));

  process.on('SIGINT', () => {
    this.app.log(['record', 'exit'], `${this.count} recordings captured.`);
    process.exit();
  });
};

Fixture.prototype.capture = function capture(req, res) {
  const url = req.url.replace(/^\//, '');
  const start = (new Date()).getTime();

  this.app.log(['record', 'proxy', req.method], url);

  request[req.method.toLowerCase()](url, (error, response) => {
    const fileName = url.replace(/\//g, '|');
    const filePath = path.resolve(this.fixturePath, fileName);
    const now = (new Date()).getTime();
    const latency = now - start;

    fs.writeFile(filePath, JSON.stringify({
      method: response.request.method,
      url,
      path: response.request.uri.path,
      options: {
        headers: response.headers,
        status: response.statusCode,
        raw: response.body,
        latency
      }
    }, null, 2));

    this.app.log(['record', 'response', 'saved'], url);

    ++this.count;

    res.set(response.headers).send(response.body);
  });
};

Fixture.prototype.record = function record(req, res) {
  if (!this.recording) this._initFixture();
  this.capture.call(this, req, res);
};

Fixture.prototype.fixture = function fixture() {
  let fileNames;

  try {
    fileNames = fs.readdirSync(this.fixturePath);
  } catch (err) {
    throw Error(`Mock Yeah Fixture ${this.fixturePath} not found`);
  }

  return fileNames.map((fileName) => {
    const filePath = path.resolve(this.fixturePath, fileName);
    return JSON.parse(fs.readFileSync(filePath));
  });
};

module.exports = Fixture;