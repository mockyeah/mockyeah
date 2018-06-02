'use strict';

const express = require('express');

const sendError = (res, err) => {
  // eslint-disable-next-line no-console
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message
  });
};

// TODO: Implement support for HTTPS admin server protocol.
module.exports = function AdminServer(config, app) {
  const admin = express();

  // `/record?name=foo&options={}`
  admin.use('/record', (req, res) => {
    if (!req.query.name) {
      const err = new Error('Must provide record name.');
      err.status = 400;
      sendError(res, err);
      return;
    }

    const { name, options } = req.query;

    try {
      app.record(name, options ? JSON.parse(options) : undefined);
    } catch (err) {
      sendError(res, err);
      return;
    }

    res.status(204).end();
  });

  admin.use('/record-stop', (req, res) => {
    try {
      app.recordStop(err => {
        if (err) {
          sendError(err);
          return;
        }

        res.status(204).end();
      });
    } catch (err) {
      sendError(err);
    }
  });

  // `/play?name=foo`
  admin.use('/play', (req, res) => {
    if (!req.query.name) {
      const err = new Error('Must provide play name.');
      err.status = 400;
      sendError(res, err);
      return;
    }

    try {
      app.play(req.query.name);
    } catch (err) {
      sendError(res, err);
      return;
    }

    res.status(204).end();
  });

  return admin;
};
