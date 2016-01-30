'use strict';
global.MOCK_YEAH_ROOT = __dirname;

const mockyeah = require('mockyeah');
const dateformat = require('dateformat');
const recordingName = dateformat(new Date(), 'yyyymmdd_HHMMss');

mockyeah.record(recordingName);