
// Add dependencies
const gulp = require('gulp');
const rollup = require('rollup-stream');
const sass = require('gulp-sass');

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
        .pipe(gulp.dest(configuration.paths.dist + '/css'))
    done();
}));

gulp.task('scss:watch', gulp.series(function (done) {
    gulp.watch('./src/style/**/*.scss', gulp.series('scss'));
    done();
}));

var ts = require('gulp-typescript');  
var tsProject = ts.createProject('./tsconfig.json');  

gulp.task('transpile-it', function () {  
    return tsProject.src()  
        .pipe(tsProject())  
        .pipe(gulp.dest('tmp'));  
});  

gulp.task('rollup', function() {
    return rollup('rollup.config.js')
      .pipe(source(configuration.paths.src.js))
      .pipe(gulp.dest('dist/js'));
  });

gulp.task('tsc:watch', gulp.series(function (done) {
    gulp.watch(['./src/**/*.ts','./src/**/*.tsx'] , gulp.series('rollup'));
    done();
}));

// Gulp default task
gulp.task('default', gulp.parallel('html', gulp.series("transpile-it", 'rollup'), 'scss'));

gulp.task('watch', gulp.series('default', gulp.parallel('tsc:watch', 'scss:watch')));