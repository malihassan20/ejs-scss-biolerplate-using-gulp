var gulp = require('gulp');
var sass = require('gulp-sass');
var pleeease = require('gulp-pleeease');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var browserSync = require('browser-sync');
var reload  = browserSync.reload;
var ejs = require("gulp-ejs");
var plumber = require("gulp-plumber");
const changed = require('gulp-changed');

// Sass

gulp.task('sass', function () {
    gulp.src('assets/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError)) // Keep running gulp even though occurred compile error
        .pipe(pleeease({
            autoprefixer: {
                browsers: ['last 2 versions']
            }
        }))
        .pipe(gulp.dest('build/assets/css'))
        .pipe(reload({stream:true}));
});

// Js-concat-uglify

gulp.task('js', function() {
    gulp.src(['assets/js/*.js'])
        //.pipe(concat('scripts.js'))
        .pipe(uglify({preserveComments: 'some'})) // Keep some comments
        .pipe(gulp.dest('build/assets/js'))
        .pipe(reload({stream:true}));
});

// Imagemin

gulp.task('imagemin', function() {
    gulp.src(['assets/images/**/*.{png,jpg,gif,svg}'], { base: 'images' })
        .pipe(imagemin({
            optimizationLevel: 7,
            use: [pngquant({
                quality: '60-80',
                speed: 1
            })]
        }))
        .pipe(changed(gulp.dest('build/assets/images')))
        .pipe(gulp.dest('build/assets/images'));
});

// Images
gulp.task('images', function () {
    const SRC = 'assets/images/**/*.{png,jpg,gif,svg}'
    const DEST = 'build/assets/images'
    gulp.src(SRC, { base: 'images' })
        .pipe(changed(DEST))
        .pipe(gulp.dest(DEST));
});

// fonts

gulp.task('fonts', function() {
    gulp.src(['assets/fonts/**/*.{woff,woff2}'])
        .pipe(gulp.dest('build/assets/fonts'));
});

// ejs

var fs = require('fs');
var json = JSON.parse(fs.readFileSync("site.json")); // parse json
gulp.task("ejs", function() {
    gulp.src(['templates/*.ejs','!' + 'templates/_*.ejs']) // Don't build html which starts from underline
        .pipe(plumber())
        .pipe(ejs(json, {"ext": ".html"}))
        .pipe(gulp.dest('build'))
});

// Static server

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "build/", //　Target directory
            index  : "index.html" // index file
        }
    });
});

// Reload all browsers

gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Task for `gulp` command

gulp.task('default',['browser-sync'], function() {
    gulp.watch('assets/sass/**/*.scss',['sass']);
    gulp.watch('assets/js/*.js',['js']);
    gulp.watch('assets/images/**', ['images']);
    gulp.watch('assets/fonts/**',['fonts']);

    gulp.watch(["build/*.html"], ['bs-reload']);
    gulp.watch(['templates/**/*.ejs', 'site.json'], ['ejs']);
});

gulp.task('build', ['sass', 'js', 'imagemin', 'images',  'fonts', 'ejs'])
