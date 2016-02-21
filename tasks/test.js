'use strict';

/* eslint-disable no-process-exit */

const gulp = require('gulp');
const gutil = require('gulp-util');
const mocha = require('gulp-mocha');
const PATH = require('./path');

function test(options) {
  const defaultOptions = {
    exit: true,
    reporter: 'spec'
  };

  options = Object.assign({}, defaultOptions, options);

  return gulp.src(PATH.tests)
    .pipe(mocha({
      reporter: options.reporter
    }))
    .once('error', function (err) {
      gutil.log(err);

      /**
       * if configured to exit, exit with a failure code;
       * else, emit 'end' event to avoid exiting.
       */
      if (options.exit) {
        process.exit(1);
      } else {
        this.emit('end');
      }
    })
    .once('end', () => {
      if (options.exit) process.exit();
    });
}

gulp.task('test', function () {
  return test();
});

gulp.task('test:watch:run', function () {
  return test({
    exit: false,
    reporter: 'dot'
  });
});

gulp.task('test:watch', ['test:watch:run'], function () {
  gulp.watch(PATH.scripts, ['test:watch:run']);
});