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
const log = require('./Logger');

const Fixture = function Fixture(fixturePath) {
  assert(fixturePath, 'Fixture path required');

  this.fixturePath = fixturePath;

  return this;
};

Fixture.prototype._initFixture = function _initFixture() {
  this.count = 0;
  this.recording = true;

  mkdirp.sync(this.fixturePath);

  log(['record', 'fixture'], tildify(this.fixturePath));

  process.on('SIGINT', () => {
    log(['record', 'exit'], `${this.count} recordings captured.`);
    process.exit();
  });
};

Fixture.prototype.capture = function capture(req, res) {
  const url = req.url.replace(/^\//, '');
  const start = (new Date()).getTime();

  log(['record', 'proxy', req.method], url);

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

    log(['record', 'response', 'saved'], url);

    ++this.count;
    res.end();
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