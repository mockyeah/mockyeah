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
const log = require('./Logger');

const RouteSeries = function RouteSeries(seriesPath) {
  assert(seriesPath, 'Series path required');

  this.seriesPath = seriesPath;

  return this;
};

RouteSeries.prototype._initSeries = function _initSeries() {
  this.count = 0;
  this.recording = true;

  log('Initiating recording...');

  mkdirp.sync(this.seriesPath);

  log(`Series location: ${this.seriesPath}`);

  process.on('SIGINT', () => {
    log(`  Recording stopped. ${this.count} recordings in series.`);
    process.exit();
  });
};

RouteSeries.prototype.capture = function capture(req, res) {
  const url = req.url.replace(/^\//, '');
  const start = (new Date()).getTime();

  log(`[${req.method}] ${url}`);

  request[req.method.toLowerCase()](url, (error, response) => {
    const fileName = (new Date()).getTime() + '.json';
    const filePath = path.resolve(this.seriesPath, fileName);
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

    log(`[SAVED] ${url}`);

    ++this.count;
    res.end();
  });
};

RouteSeries.prototype.record = function record(req, res) {
  if (!this.recording) this._initSeries();
  this.capture.call(this, req, res);
};

RouteSeries.prototype.series = function series() {
  let fileNames;

  try {
    fileNames = fs.readdirSync(this.seriesPath);
  } catch (err) {
    throw Error(`Mock Yeah Series ${this.seriesPath} not found`);
  }

  return fileNames.map((fileName) => {
    const filePath = path.resolve(this.seriesPath, fileName);
    return JSON.parse(fs.readFileSync(filePath));
  });
};

module.exports = RouteSeries;