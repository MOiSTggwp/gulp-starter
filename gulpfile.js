const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();
const zip = require('gulp-zip');
const del = require('del');
const fs = require('fs');

const paths = {
    src: {
        html: './app/src/*.html',
        style: './app/src/styles/style.scss',
        script: './app/src/scripts/**/*.js',
        img: './app/src/images/**',
        font: './app/src/fonts/**'
    },
    dest: {
        html: './app/dist/',
        style: './app/dist/css/',
        script: './app/dist/js/',
        img: './app/dist/img/',
        font: './app/dist/fonts/'
    },
    watch: {
        html: './app/src/**/*.html',
        style: './app/src/styles/**/*.scss',
    }
};

function clean() {
    return del([
        './app/dist/*',
        '!./app/dist/img'
    ]);
}

function html() {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.dest.html));
}

function style() {
    return gulp.src(paths.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dest.style));
}

function script() {
    return gulp.src(paths.src.script)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dest.script));
}

function img() {
    return gulp.src(paths.src.img)
        .pipe(newer(paths.dest.img))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(paths.dest.img));
}

function font() {
    return gulp.src(paths.src.font)
        .pipe(newer(paths.dest.font))
        .pipe(fonter({
            formats: ["ttf", "woff", "eot", "svg"]
        }))
        .pipe(gulp.dest(paths.dest.font))
        .pipe(ttf2woff2())
        .pipe(gulp.dest(paths.dest.font));
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./app/dist/"
        }
    });

    gulp.watch(paths.watch.html, html);
    gulp.watch(paths.watch.style, style);
    gulp.watch(paths.src.script, script);
    gulp.watch(paths.src.img, img);
    gulp.watch(paths.src.font, font);
    gulp.watch(paths.dest.html).on('change', browserSync.reload);
}

function zipDeploy() {
    del('./app.zip');
    return gulp.src('./app/dist/**/*.*')
        .pipe(zip('app.zip'))
        .pipe(gulp.dest('./'));
}

const parallel = gulp.parallel(style, script, img, font, html);
const build = gulp.series(clean, parallel, watch);
const deployZIP = gulp.series(clean, parallel, zipDeploy);

exports.clean = clean;
exports.html = html;
exports.style = style;
exports.script = script;
exports.img = img;
exports.font = font;
exports.watch = watch;
exports.zip = deployZIP;
exports.build = build;
exports.default = build;