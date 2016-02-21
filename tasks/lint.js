'use strict';

/* eslint-disable no-process-exit */

const gulp = require('gulp');
const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const PATH = require('./path');

function lint(options) {
  options = options || { exit: true };

  return gulp.src(PATH.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(options.exit ? eslint.failAfterError() : gutil.noop());
}

gulp.task('lint', () => {
  return lint();
});

gulp.task('lint:watch:run', () => {
  return lint({ exit: false });
});

gulp.task('lint:watch', ['lint:watch:run'], () => {
  gulp.watch(PATH.scripts, ['lint:watch:run']);
});