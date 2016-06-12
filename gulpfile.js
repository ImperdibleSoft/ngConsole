'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var del = require('del');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var gulpSequence = require('gulp-sequence');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;

var prodEnv   = './demo';
var buildEnv  = './build';
var devEnv    = './src';
var htmlGlob  = devEnv + '/**/*.html';
var sassGlob  = devEnv + '/**/*.scss';
var jsGlob    = devEnv + '/**/*.js';

/* AUTOMATED LAUNCH */
// Parse all ./src files into ./dist folder, with 1 CSS variation. Launch webserver
gulp.task('default', gulpSequence('clean', 'parse', 'build', 'webserver'));

/* CLEANING */
// Clean production directory
gulp.task('clean', function(){
  return gulp.src([
    prodEnv + '/*',
    '!' + prodEnv + '/index.html',
    '!' + prodEnv + '/img',
    '!' + prodEnv + '/img/*',
    buildEnv + '/*'
  ], {read: false})
  .pipe(clean());
});

/* PARSING */
// Parse html files and save them into ./dist/templates
gulp.task('html', function() {
  return gulp.src(htmlGlob, {base: 'src/'})
   .pipe(rename(function(path) {
      var singleRoute = path.dirname;
      var pos = singleRoute.indexOf("\/");
      if (pos < 0) { pos = singleRoute.indexOf("\\"); }
      var finalPath = singleRoute.substring(0, pos);
      path.dirname = finalPath;
   }))
   .pipe(gulp.dest(prodEnv + '/templates'));
});

// Parse js files and save them into ./dist/js
gulp.task('js', function(){
  return gulp.src(jsGlob, {base: 'src/'})
   .pipe(rename(function(path) {
      var singleRoute = path.dirname;
      var pos = singleRoute.indexOf("\/");
      if (pos < 0) { pos = singleRoute.indexOf("\\"); }
      var finalPath = singleRoute.substring(0, pos);
      path.dirname = finalPath;
   }))
   .pipe(gulp.dest(prodEnv + '/js'));
});

// Parse all ./src files into ./dist folder
gulp.task('parse', gulpSequence(['html', 'js']));

// Concat all CSS, Libraries and JS files, and minify them if necessary
gulp.task('combineJS', function(){

  /* If combine parameter is sent */
  if(argv.combine || argv.minify){

    // Combine JS
    return gulp.src([
      prodEnv + '/js/app.js',
      prodEnv + '/js/*.js'
    ])
      .pipe(clean())
      .pipe(gulpif(argv.minify, uglify()))
      .pipe(concat('app.js'))
      .pipe(gulp.dest(prodEnv + '/js'));
  }

  /* If combine parameter is not sent */
  else{
    return ;
  }
});

// Move ngConsole.js to build env
gulp.task('jsToBuild', function(){

  // Move to build folder
  return gulp.src([
    devEnv + '/js/ngConsole.js'
  ])
    .pipe(rename(function(path) {
      var singleRoute = path.dirname;
      var pos = singleRoute.indexOf("\/");
      if (pos < 0) { pos = singleRoute.indexOf("\\"); }
      var finalPath = singleRoute.substring(0, pos);
      path.dirname = finalPath;
    }))
    .pipe(gulp.dest(buildEnv));
});

// Uglify ngConsole
gulp.task('compressBuild', function(){

  // Minify and uglify
  return gulp.src([
    buildEnv + '/ngConsole.js'
  ])
    .pipe(uglify())
    .pipe(concat('ngConsole.js'))
    .pipe(gulp.dest(buildEnv));
});

// Combine, uglify, minify files
gulp.task('buildDirective', function(callback){ gulpSequence('jsToBuild', 'compressBuild')(callback) });
gulp.task('build', function(callback){ gulpSequence(['combineJS', 'buildDirective'])(callback) });

/* SERVING */
gulp.task('htmlUpdate', function(callback){ gulpSequence('html')(callback) });
gulp.task('jsUpdate', function(callback){ gulpSequence('js', 'build')(callback) });

// Watch for changes into ./src and make a new build
gulp.task('watcher', function(){
  gulp.watch([devEnv + '/**/*.html'], ['htmlUpdate']);
  gulp.watch([devEnv + '/**/*.js'], ['jsUpdate']);
});

// Launch webserver
gulp.task('webserver', ['watcher'], function() {
  return gulp.src(prodEnv)
    .pipe(webserver({
      host: 'localhost',
      port: '9000',
      livereload: true,
      open: true
    }));
});
