'use strict';

/* eslint-disable no-process-exit */

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

const paths = {
  scripts: ['!node_modules/**', './**/*.js'],
  tests: ['./test/**/*-test.js']
};

gulp.task('lint', function lint() {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', () => {
  return gulp.src(paths.tests)
    .pipe(mocha())
    // Explicitly exits to avoid hanging
    .once('error', () => {
      process.exit(1);
    })
    .once('end', () => {
      process.exit();
    });
});

/**
 * Special `tdd-test` task exists due to `test` needing to explicitly exit
 */
gulp.task('tdd-test', () => {
  return gulp.src(paths.tests)
    .pipe(mocha({
      reporter: 'dot'
    }));
});

gulp.task('tdd', function tdd() {
  gulp.watch(paths.scripts, ['lint', 'tdd-test']);
});

gulp.task('default', ['lint']);
