'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var compass = require('gulp-compass');
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
var distEnv   = './dist';
var devEnv    = './src';
var htmlGlob  = devEnv + '/**/*.html';
var sassGlob  = devEnv + '/**/*.scss';
var jsGlob    = devEnv + '/**/*.js';

/* AUTOMATED LAUNCH */
// Parse all ./src files into ./dist folder, with 1 CSS variation. Launch webserver
gulp.task('default', gulpSequence('clean', 'parse', 'build', 'webserver'));

// Parse all .src files into .dist folder, with all CSS variations. No webserver.
gulp.task('production', gulpSequence('clean', 'parse', 'build'));

/* CLEANING */
// Clean production directory
gulp.task('clean', function(){
  return gulp.src([prodEnv + '/*', distEnv + '/*', '!' + prodEnv + '/index.html'], {read: false})
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

// Parse sass files and save them into ./dist/css
gulp.task('sass', function () {
  return gulp.src( devEnv + "/css/")
    .pipe(compass({
      css: prodEnv + '/css',
      sass: devEnv + '/css',
      comments: true
    }));
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
gulp.task('parse', gulpSequence(['html', 'sass', 'js']));

/* BUILDING */
// Concat all CSS, Libraries and JS files, and minify them if neccesary
gulp.task('combineCSS', function(){

  /* If combine parameter is sent */
  if(argv.combine || argv.minify){

    // Combine CSS
    return gulp.src(prodEnv + '/css/*.css')
      .pipe(clean())
      .pipe(gulpif(argv.minify, minifyCSS()))
      .pipe(concat('console.css'))
      .pipe(gulp.dest(prodEnv + '/css'));
  }

  /* If combine parameter is not sent */
  else{
    return ;
  }
});

// Concat all CSS, Libraries and JS files, and minify them if neccesary
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

// Make the 3 combinations
gulp.task('build', gulpSequence(['combineCSS', 'combineJS']));

/* SERVING */
// Watch for changes into ./src and make a new build
gulp.task('watcher', function(){
  gulp.watch([devEnv + '/**/*.scss'], ['sass']);
  gulp.watch([devEnv + '/**/*.js'], ['js']);
  gulp.watch([devEnv + '/**/*.html'], ['html']);
});

// Launch webserver
gulp.task('webserver', ['watcher'], function() {
  return gulp.src(prodEnv)
    .pipe(webserver({
      host: 'localhost',
      livereload: true,
      open: true
    }));
});
