'use strict';

const gulp = require('gulp');
const PATH = require('./tasks/path');

// Load gulp tasks
require('./tasks/lint');

gulp.task('default', ['lint']);
