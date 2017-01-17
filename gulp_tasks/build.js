const gulp = require('gulp');
const filter = require('gulp-filter');
const useref = require('gulp-useref');
const lazypipe = require('lazypipe');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const htmlmin = require('gulp-htmlmin');
const sourcemaps = require('gulp-sourcemaps');
const uglifySaveLicense = require('uglify-save-license');
const inject = require('gulp-inject');
const ngAnnotate = require('gulp-ng-annotate');
var concat = require('gulp-concat');

const conf = require('../conf/gulp.conf');

gulp.task('build', build);

function build() {

  gulp.src(conf.path.tmp('templateCacheHtml.js'))
    .pipe(ngAnnotate())
    .pipe(concat('angular-planning-templates.js'))
    .pipe(gulp.dest(conf.path.dist()))
    .pipe(uglify({preserveComments: uglifySaveLicense})).on('error', conf.errorHandler('Uglify'))
    .pipe(concat('angular-planning-templates.min.js'))
    .pipe(gulp.dest(conf.path.dist()));

  const htmlFilter = filter(conf.path.tmp('**/*.html'), {restore: true});
  const jsFilter = filter(conf.path.tmp('**/*.js'), {restore: true});
  const cssFilter = filter(conf.path.tmp('**/*.css'), {restore: true});

  return gulp.src(conf.path.tmp('angular-planning/**'))
    .pipe(jsFilter)
    .pipe(ngAnnotate())
    .pipe(concat('angular-planning.js'))
    .pipe(gulp.dest(conf.path.dist()))
    .pipe(uglify({preserveComments: uglifySaveLicense})).on('error', conf.errorHandler('Uglify'))
    .pipe(concat('angular-planning.min.js'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(concat('angular-planning.css'))
    .pipe(gulp.dest(conf.path.dist()))
    .pipe(cssnano())
    .pipe(concat('angular-planning.min.css'))
    .pipe(gulp.dest(conf.path.dist()));
}
