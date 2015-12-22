'use strict';

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Mock Yeah!');
});

module.exports.app = app;