'use strict';

/* eslint-disable import/no-extraneous-dependencies, node/no-extraneous-require */
global.MOCKYEAH_ROOT = __dirname;

const mockyeah = require('mockyeah');

mockyeah.play('some-custom-capture');
