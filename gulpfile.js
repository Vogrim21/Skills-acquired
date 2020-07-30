'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemap = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var server = require('browser-sync').create();
var less = require('gulp-less');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');


gulp.task('css', function () {
  return gulp.src('source/less/style.less')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
});

gulp.task('script', function () {
  return gulp.src([
    'node_modules/picturefill/dist/picturefill.min.js',
    'node_modules/svg4everybody/dist/svg4everybody.min.js',
    'source/js/*.js'
  ], {
    sourcemaps: true
  }).pipe(plumber())
    .pipe(concat('script.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build/js'), {
    sourcemaps: '.'
  });
});

gulp.task('sprite', function () {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(imagemin([
      imagemin.svgo()
    ]))
    .pipe(svgstore({
        inlineSvg: true
    }))
    .pipe(rename('symbol.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'));
});

gulp.task('images', function () {
  return gulp.src('source/img/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('copy', function () {
  return gulp.src([
    'source/*.html',
    'source/fonts/**/*.{woff,woff2}',
    'source/*.ico'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
 });

 gulp.task('clean', function () {
  return del('build');
 });

gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/less/**/*.less', gulp.series('css', 'refresh'));
  gulp.watch('source/js/**/*.js', gulp.series('script', 'refresh'));
  gulp.watch('source/img/sprite/*.svg', gulp.series('sprite', 'refresh'));
  gulp.watch('source/*.html', gulp.series('copy', 'refresh'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('build', gulp.series('clean', 'images', 'webp', 'copy', 'script', 'css', 'sprite'));
gulp.task('start', gulp.series('build', 'server'));
