'use strict';

/* eslint-disable no-process-exit */

const gulp = require('gulp');
const eslint = require('gulp-eslint');

const paths = {
  scripts: ['!node_modules/**', './**/*.js']
};

gulp.task('lint', () => {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('lint:watch', ['lint'], () => {
  return gulp.watch(paths.scripts, ['lint']);
});

gulp.task('default', ['lint']);
