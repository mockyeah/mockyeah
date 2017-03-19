'use strict';
/* eslint-disable no-process-exit, no-sync */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function normalizeRewritePath(_path) {
  return _path.replace(/[\?\=\&\%\+]+/g, '_').replace(/^\/?/, '/');
}

function filterFileNames(fileNames) {
  const hiddenFileName = /^\./;
  return fileNames.filter((fileName) => {
    return !hiddenFileName.test(fileName);
  });
}

/**
 * CapturePlayer
 *   Prepares mockyeah to mount a recording.
 */
function CapturePlayer(app, captureName) {
  assert(app, 'App instance required');
  assert(captureName, 'Capture name required');

  this.app = app;
  this.path = path.resolve(app.config.capturesDir, captureName);

  /**
   * Configure URL rewrite middleware
   * Necessary to share services between equivilent proxy
   * routes and normal routes. Meaning, the following two routes
   * should be routed to the same `/some/service` end point:
   * - http://localhost:3001/http://example.com/some/service
   * - http://localhost:3001/some/service
   */
  app.use((req, res, next) => {
    const proxiedUrl = req.url.replace(/^\//, '');
    req.preRewriteUrl = require('url').parse(proxiedUrl).path;
    req.url = normalizeRewritePath(req.preRewriteUrl);
    app.log(['request', 'rewrite'], `${req.originalUrl} to ${req.url}`, true);
    next();
  });

  return this;
}

CapturePlayer.prototype.files = function files() {
  let fileNames;

  // Check if capture directory exists
  try {
    fileNames = fs.readdirSync(this.path);
  } catch (err) {
    throw Error(`mockyeah capture ${this.path} not found`);
  }

  fileNames = filterFileNames(fileNames);

  return fileNames.map((fileName) => {
    const filePath = path.resolve(this.path, fileName);
    let route;

    try {
      route = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
      throw new Error(`Invalid mockyeah capture JSON: ${filePath}`);
    }

    // Prepare properties
    route.originalPath = route.path;
    route.path = normalizeRewritePath(route.path);
    route.method = route.method.toLowerCase();

    return route;
  });
};

module.exports = CapturePlayer;