var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  cache = require('gulp-cache'),
  del = require('del'),
  runSequence = require('run-sequence'),
  sass = require('gulp-sass'),
  cssnano = require('gulp-cssnano'),
  sourcemaps = require('gulp-sourcemaps'),
  cp = require('child_process');

// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: ['dist']
    }
  });
});

// Copy vemdor js to src
gulp.task('vendorjs', function () {
  return gulp
    .src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/popper.js/dist/umd/popper.js',
      'node_modules/popper.js/dist/umd/popper.js.map',
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/bootstrap/dist/js/bootstrap.js.map',
      'src/uploads/js/vendor/*.js'
    ])
    .pipe(gulp.dest('dist/uploads/js'));
});

// Compile sass to css
gulp.task('sass', function () {
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    //.pipe(cssnano())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist/css'))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

// gulp.task('vendorCSS', function() {
// 	return gulp
// 		.src()
// 		.pipe(gulp.dest('dist/css'));
// });

// Copy js to dist
gulp.task('scripts', function () {
  return gulp.src(['src/uploads/js/*.png', 'src/uploads/js/*.json']).pipe(gulp.dest('dist/uploads/js'));
});

// Transpile the project js files to dist using babel
gulp.task('transpile', function () {
  return cp.exec('npx babel src/uploads/js/*.js --out-dir dist/uploads/js');
});

gulp.task('html', function () {
  return gulp.src('src/**/*.html').pipe(gulp.dest('dist'));
});

// Watchers
gulp.task('watch', function () {
  gulp.watch('src/scss/**/*.scss', ['sass']);
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/uploads/js/**/*.js', ['transpile']);
  gulp.watch('dist/**/*').on('change', function () {

    browserSync.reload();
  });
});

// Copy images
gulp.task('images', function () {
  return gulp
    .src('src/uploads/images/**/*.+(png|jpg|gif|svg)')
    .pipe(gulp.dest('dist/uploads/images'));
});

// Clean Dist
gulp.task('clean', function () {
  return del.sync('dist').then(function (cb) {
    return cache.clearAll(cb);
  });
});

gulp.task('clean:dist', function () {
  return del.sync('dist/**/*');
});

// Build Sequence
// --------------
gulp.task('default', function (callback) {
  runSequence(['vendorjs', 'sass', 'html', 'browserSync'], 'watch', callback);
});

gulp.task('build', function (callback) {
  runSequence(
    'clean:dist',
    'vendorjs',
    'sass',
    [
      'html',
      //'vendorCSS',
      'scripts',
      'transpile',
      'images'
    ],
    callback
  );
});
