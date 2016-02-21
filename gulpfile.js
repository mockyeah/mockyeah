'use strict';

const gulp = require('gulp');
const PATH = require('./tasks/path');

// Load gulp tasks
require('./tasks/lint');
require('./tasks/test');

gulp.task('tdd', ['lint:watch:run', 'test:watch:run'], () => {
  return gulp.watch(PATH.scripts, ['lint:watch:run', 'test:watch:run']);
});
gulp.task('default', ['lint', 'test']);
