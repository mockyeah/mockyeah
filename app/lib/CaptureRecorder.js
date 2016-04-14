'use strict';
/* eslint-disable no-process-exit, no-sync */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const request = require('request');
const tildify = require('tildify');
const now = () => (new Date()).getTime();

/**
 * RouteRecorder
 *  Implements mockyeah proxy to record http traffic.
 */
function CaptureRecorder(app, captureName) {
  assert(app, 'App instance required');
  assert(captureName, 'Capture name required');

  this.app = app;
  this.capturePath = path.normalize(app.config.capturesDir + '/' + captureName);
  this.count = 0;

  mkdirp.sync(this.capturePath);

  this.app.log(['record', 'capture'], tildify(this.capturePath));

  return this;
}

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

function resolveFilePath(capturePath, url) {
  const fileName = url.replace(/\//g, '|');
  return path.resolve(capturePath, fileName);
}

CaptureRecorder.prototype.record = function record(req, res) {
  const method = req.method.toLowerCase();
  const url = req.url.replace(/^\//, '');
  const startTime = now();

  this.app.log(['record', 'proxy', req.method], url);

  request[method](url, (error, response) => {
    if (error) return this.app.log(['record', 'response', 'error'], error);
    const filePath = resolveFilePath(this.capturePath, url);
    response.url = url;
    response.latency = now() - startTime;
    writeFile(filePath, response);
    this.app.log(['record', 'response', 'saved'], url);
    ++this.count;
  }).pipe(res);
};

module.exports = CaptureRecorder;