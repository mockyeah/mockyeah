'use strict';

/* eslint-disable no-process-exit */

const gulp = require('gulp');
const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

const paths = {
  scripts: ['!node_modules/**', './**/*.js'],
  tests: ['./test/**/*Test.js']
};

gulp.task('lint', function lint() {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

function test(options) {
  options = options || {
    exit: true
  };

  return gulp.src(paths.tests)
    .pipe(mocha())
    .once('error', function (err) {
      gutil.log(err);

      if(options.exit) { // if configured to exit, exit with a failure code
        process.exit(1);
      } else { // else, emit 'end' event to avoid exiting
        this.emit('end');
      }
    })
    .once('end', () => {
      if(options.exit) process.exit();
    });
}

gulp.task('test', function () {
  return test();
});

gulp.task('test:watch:run', function () {
  return test({ exit: false });
});

gulp.task('test:watch', ['test:watch:run'], function () {
  gulp.watch(paths.scripts, ['test:watch:run']);
});

gulp.task('default', ['lint']);
