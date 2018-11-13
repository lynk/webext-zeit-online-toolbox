const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');


const sassSrc = './scss/**/*.scss';
const cssDest = './css/';
const jsSrc = './js/';

let T = {

    css: (done)=> {
        gulp.src(sassSrc)
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest(cssDest));
        done();

    },

    concat: (done)=> {

        gulp.src(['./js/options.js', './js/popup.js'])
            .pipe(concat('options_bundle.js'))
            .pipe(gulp.dest('./js/'));
        done();
    }
};


gulp.task('css', T.css);
gulp.task('concat', T.concat);

// Watchers
gulp.task('watch', function () {
    gulp.watch([sassSrc, jsSrc, '!./js/options_bundle.js'], gulp.parallel(['css', 'concat']));
});