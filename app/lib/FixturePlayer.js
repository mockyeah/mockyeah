'use strict';

/* eslint-disable no-process-exit, no-sync */

/**
 * FixturePlayer
 * Prepares mockyeah to mount a recording.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function normalizeRewritePath(_path) {
  return _path.replace(/[\?\=\&\%]+/g, '_').replace(/^\/?/, '/');
}

function FixturePlayer(app, fixtureName) {
  assert(app, 'App instance required');
  assert(fixtureName, 'Fixture name required');

  this.app = app;
  this.path = path.resolve(app.config.fixturesDir, fixtureName);

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

FixturePlayer.prototype.files = function files() {
  let fileNames;

  // Check if fixture directory exists
  try {
    fileNames = fs.readdirSync(this.path);
  } catch (err) {
    throw Error(`mockyeah fixture ${this.path} not found`);
  }

  return fileNames.map((fileName) => {
    const filePath = path.resolve(this.path, fileName);
    const route = JSON.parse(fs.readFileSync(filePath));

    // Prepare properties
    route.originalPath = route.path;
    route.path = normalizeRewritePath(route.path);
    route.method = route.method.toLowerCase();

    return route;
  });
};

module.exports = FixturePlayer;