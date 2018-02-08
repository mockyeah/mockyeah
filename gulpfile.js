'use strict';

const gulp = require('gulp');

// Load gulp tasks
require('./tasks/lint');

gulp.task('default', ['lint']);
