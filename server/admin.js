'use strict';

const express = require('express');

// TODO: Implement support for HTTPS admin server protocol.
module.exports = function AdminServer(config, app) {
  const admin = express();

  // `/record?name=foo&options={}`
  admin.use('/record', (req, res, next) => {
    if (!req.query.name) {
      const err = new Error('Must provide record name.');
      err.status = 400;
      next(err);
      return;
    }

    const { name, options } = req.query;

    try {
      app.record(name, options ? JSON.parse(options) : undefined);
    } catch (err) {
      next(err);
      return;
    }

    res.status(204).end();
  });

  admin.use('/record-stop', (req, res, next) => {
    try {
      app.recordStop(err => {
        if (err) {
          next(err);
          return;
        }

        res.status(204).end();
      });
    } catch (err) {
      next(err);
    }
  });

  // `/play?name=foo`
  admin.use('/play', (req, res, next) => {
    if (!req.query.name) {
      const err = new Error('Must provide play name.');
      err.status = 400;
      next(err);
      return;
    }

    try {
      app.play(req.query.name);
    } catch (err) {
      next(err);
      return;
    }

    res.status(204).end();
  });

  return admin;
};
