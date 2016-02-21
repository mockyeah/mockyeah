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

const now = () => (new Date()).getTime();

function writeFile(filePath, data) {
  data = {
    method: data.request.method,
    url: data.url,
    path: data.request.uri.path,
    options: {
      headers: data.headers,
      status: data.statusCode,
      raw: data.body,
      latency: data.latency
    }
  };

  fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function resolveFilePath(fixturePath, url) {
  const fileName = url.replace(/\//g, '|');
  return path.resolve(fixturePath, fileName);
}

function FixtureRecorder(app, fixtureName) {
  assert(app, 'App instance required');
  assert(fixtureName, 'Fixture name required');

  this.app = app;
  this.fixturePath = path.resolve(app.config.fixturesDir, fixtureName);
  this.count = 0;

  mkdirp.sync(this.fixturePath);

  this.app.log(['record', 'fixture'], tildify(this.fixturePath));

  process.on('SIGINT', () => {
    this.app.log(['record', 'exit'], `${this.count} recordings captured.`);
    process.exit();
  });

  return this;
}

FixtureRecorder.prototype.record = function record(req, res) {
  const method = req.method.toLowerCase();
  const url = req.url.replace(/^\//, '');
  const startTime = now();

  this.app.log(['record', 'proxy', req.method], url);

  request[method](url, (error, response) => {
    if (error) return this.app.log(['record', 'response', 'error'], error);
    const filePath = resolveFilePath(this.fixturePath, url);
    response.url = url;
    response.latency = now() - startTime;
    writeFile(filePath, response);
    this.app.log(['record', 'response', 'saved'], url);
    ++this.count;
  }).pipe(res);
};

module.exports = FixtureRecorder;