'use strict';

exports.accessControlAllowOrigin = function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

exports.logRequest = function logRequest(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
};
