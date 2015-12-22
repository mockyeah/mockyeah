'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

const paths = {
  scripts: ['!node_modules/**', './**/*.js']
};

gulp.task('lint', function lint() {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('tdd', function tdd() {
  gulp.watch(paths.scripts, ['lint']);
});

gulp.task('default', ['lint']);
