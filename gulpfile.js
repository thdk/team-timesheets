
// Add dependencies
const gulp = require('gulp');
const rollup = require('rollup-stream');
const sass = require('gulp-sass');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const source = require('vinyl-source-stream');

// Configuration
const configuration = {
    paths: {
        src: {
            html: './src/*.html',
            css: [
                './src/style/*.scss'
            ],
            js: 'src/app.ts'
        },
        dist: './dist'
    }
};

// Gulp task to copy HTML files to output directory
gulp.task('html', gulp.series(function (done) {
    gulp.src(configuration.paths.src.html)
        .pipe(gulp.dest(configuration.paths.dist));
    done();
}));

// Gulp task to concatenate our scss files
gulp.task('scss', gulp.series(function (done) {
    gulp.src(configuration.paths.src.css)
        .pipe(sass({
            includePaths: ['node_modules/'] // added includePaths to resolve scss partials from node modules
        }).on('error', sass.logError))
        .pipe(postcss([ autoprefixer() ]))
        .pipe(gulp.dest(configuration.paths.dist + '/css'))
    done();
}));

gulp.task('scsswatch', gulp.series(function (done) {
    gulp.watch('./src/style/**/*.scss', gulp.series('scss'));
    done();
}));

gulp.task('bundle', function() {
    return rollup('rollup.config.js')
      .pipe(source("app.js")) // name of the output file
      .pipe(gulp.dest('dist/js')); // location to put the output file

  });

gulp.task('tswatch', gulp.series(function (done) {
    gulp.watch(['./src/**/*.ts','./src/**/*.tsx'] , gulp.series('bundle'));
    done();
}));

// Gulp default task
gulp.task('default', gulp.parallel('html', 'bundle', 'scss'));

gulp.task('watch', gulp.series('default', gulp.parallel('tswatch', 'scsswatch')));