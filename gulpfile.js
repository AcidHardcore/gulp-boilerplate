/**
 * Settings
 * Turn on/off build features
 */

let settings = {
  clean: true,
  scripts: true,
  libs: true,
  polyfills: true,
  styles: true,
  svgs: true,
  sprite: true,
  images: true,
  copy: true,
  reload: true
};


/**
 * Paths to project folders
 */

let paths = {
  input: 'src/',
  output: 'dist/',
  scripts: {
    input: 'src/js/*',
    watchPath: 'src/js/**/*.js',
    polyfills: '.polyfill.js',
    output: 'dist/js/'
  },
  libs: {
    input: 'src/libs/*',
    output: 'dist/js/'
  },
  styles: {
    input: 'src/sass/**/*.{scss,sass}',
    output: 'dist/css/'
  },
  images: {
    input: 'src/img/**/*.{jpg,jpeg,gif,png}',
    output: 'dist/img/'
  },
  svgs: {
    input: 'src/svg/*.svg',
    output: 'dist/img/'
  },
  copy: {
    input: 'src/copy/**/*',
    output: 'dist/'
  },
  reload: './dist/'
};


/**
 * Template for banner to add to file headers
 */

let banner = {
  main:
    '/*!' +
    ' <%= pkg.name %> v<%= pkg.version %>' +
    ' | (c) ' + new Date().getFullYear() + ' <%= pkg.author.name %>' +
    ' | <%= pkg.license %> License' +
    ' | <%= pkg.repository.url %>' +
    ' */\n'
};


/**
 * Gulp Packages
 */

// General
const {gulp, src, dest, watch, series, parallel} = require('gulp');
const del = require('del');
const flatmap = require('gulp-flatmap');
const lazypipe = require('lazypipe');
const rename = require('gulp-rename');
const header = require('gulp-header');
const pkg = require('./package.json');

// Scripts
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const concat = require('gulp-concat');
const uglify = require('gulp-terser');
const optimizejs = require('gulp-optimize-js');

// Styles
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const prefix = require('autoprefixer');
const minify = require('cssnano');
const mqpacker = require("css-mqpacker");
const inlineSVG = require('postcss-inline-svg');

// SVGs
const svgmin = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');

//Images
let imagemin = require('gulp-imagemin');

// BrowserSync
const browserSync = require('browser-sync');


/**
 * Gulp Tasks
 */

// Remove pre-existing content from output folders
let cleanDist = function (done) {

  // Make sure this feature is activated before running
  if (!settings.clean) return done();

  // Clean the dist folder
  del.sync([
    paths.output
  ]);

  // Signal completion
  return done();

};

// Repeated JavaScript tasks
let jsTasks = lazypipe()
  .pipe(header, banner.main, {pkg: pkg})
  .pipe(optimizejs)
  .pipe(dest, paths.scripts.output)
  .pipe(rename, {suffix: '.min'})
  .pipe(uglify)
  .pipe(optimizejs)
  .pipe(header, banner.main, {pkg: pkg})
  .pipe(dest, paths.scripts.output);

// Lint, minify, and concatenate scripts
let buildScripts = function (done) {

  // Make sure this feature is activated before running
  if (!settings.scripts) return done();

  // Run tasks on script files
  return src(paths.scripts.input)
    .pipe(flatmap(function (stream, file) {

      // If the file is a directory
      if (file.isDirectory()) {

        // Setup a suffix letiable
        let suffix = '';

        // If separate polyfill files enabled
        if (settings.polyfills) {

          // Update the suffix
          suffix = '.polyfills';

          // Grab files that aren't polyfills, concatenate them, and process them
          src([file.path + '/*.js', '!' + file.path + '/*' + paths.scripts.polyfills])
            .pipe(concat(file.relative + '.js'))
            .pipe(jsTasks());

        }

        // Grab all files and concatenate them
        // If separate polyfills enabled, this will have .polyfills in the filename
        src(file.path + '/*.js')
          .pipe(concat(file.relative + suffix + '.js'))
          .pipe(jsTasks());

        return stream;

      }

      // Otherwise, process the file
      return stream.pipe(jsTasks());

    }));

};

// Lint scripts
let lintScripts = function (done) {

  // Make sure this feature is activated before running
  if (!settings.scripts) return done();

  // Lint scripts
  return src(paths.scripts.input)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

};

// Process, lint, and minify Sass files
let buildStyles = function (done) {

  // Make sure this feature is activated before running
  if (!settings.styles) return done();

  // Run tasks on all Sass files
  return src(paths.styles.input)
    .pipe(sass({
      outputStyle: 'expanded',
      sourceComments: true
    }))
    .pipe(postcss([
      prefix({
        cascade: true,
        remove: true
      }),
      mqpacker({
        sort: true
      }),
      inlineSVG()
    ]))
    .pipe(header(banner.main, {pkg: pkg}))
    .pipe(dest(paths.styles.output))
    .pipe(rename({suffix: '.min'}))
    .pipe(postcss([
      minify({
        preset: ["default", { discardComments: { removeAll: true } }],
      })
    ]))
    .pipe(dest(paths.styles.output));

};

// Optimize SVG files
let buildSVGs = function (done) {

  // Make sure this feature is activated before running
  if (!settings.svgs) return done();

  // Optimize SVG files
  return src(paths.svgs.input)
    .pipe(svgmin())
    .pipe(dest(paths.svgs.output));

};

//make SVG sprite
let svgSprite =  function (done) {

  // Make sure this feature is activated before running
  if (!settings.sprite) return done();

  return src(paths.svgs.input)
    .pipe(svgmin(function (file) {
      return {
        plugins: [{
          cleanupIDs: {
            minify: true
          }
        }]
      }
    }))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(dest(paths.svgs.output));
};

// Copy static files into output folder
let images = function (done) {

  // Make sure this feature is activated before running
  if (!settings.images) return done();

  // optimize images
  return src(paths.images.input)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 70, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
    ]))
    .pipe(dest(paths.images.output));

};

let copyFiles = function (done) {

  // Make sure this feature is activated before running
  if (!settings.copy) return done();

  // Copy static files
  return src(paths.copy.input)
    .pipe(dest(paths.copy.output));

};

let copyJSLibs = function (done) {

  // Make sure this feature is activated before running
  if (!settings.libs) return done();

  // Copy static files
  return src(paths.libs.input)
    .pipe(dest(paths.libs.output));

};

// Watch for changes to the src directory
let startServer = function (done) {

  // Make sure this feature is activated before running
  if (!settings.reload) return done();

  // Initialize BrowserSync
  browserSync.init({
    server: {
      baseDir: paths.reload
    }
  });

  // Signal completion
  done();

};

// Reload the browser when files change
let reloadBrowser = function (done) {
  if (!settings.reload) return done();
  browserSync.reload();
  done();
};

// Watch for changes
let watchSource = function (done) {
  watch(paths.scripts.watchPath, series(exports.scripts, reloadBrowser));
  watch(paths.libs.input, series(exports.copyJSLibs, reloadBrowser));
  watch(paths.styles.input, series(exports.styles, reloadBrowser));
  watch([paths.svgs.input, paths.images.input], series(exports.assets, reloadBrowser));
  watch(paths.copy.input, series(exports.copyFiles, reloadBrowser));
  done();
};


/**
 * Export Tasks
 */

// Default task
// gulp
exports.default = series(
  cleanDist,
  parallel(
    buildScripts,
    lintScripts,
    buildStyles,
    buildSVGs,
    svgSprite,
    images,
    copyFiles,
    copyJSLibs
  )
);

// Watch and reload
// gulp watch
exports.watch = series(
  exports.default,
  startServer,
  watchSource
);

//Build and link scripts
exports.scripts = parallel(
  buildScripts,
  lintScripts,
);

//Compile styles
exports.styles = buildStyles;

exports.assets = series(
  buildSVGs,
  svgSprite,
  images
);

//Copy files
exports.copyFiles = copyFiles;

//Copy Libs
exports.copyJSLibs = copyJSLibs;






