const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const del = require('del');

const paths = {
    src: {
        style: './app/src/styles/**/*.scss',
        script: './app/src/scripts/**/*.js'
    },
    dest: {
        style: './app/dist/css/',
        script: './app/dist/js/'
    }
};

function clean() {
    return del([
        './app/dist'
    ]);
}

function style() {
    return gulp.src(paths.src.style)
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dest.style));
}

function script() {
    return gulp.src(paths.src.script, {
        sourcemaps: true
    })
        .pipe(babel())
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.dest.script));
}

function watch() {
    gulp.watch(paths.src.style, style);
    gulp.watch(paths.src.script, script);
}

const build = gulp.series(clean, gulp.parallel(style, script), watch);

exports.clean = clean;
exports.style = style;
exports.script = script;
exports.watch = watch;
exports.build = build;
exports.default = build;