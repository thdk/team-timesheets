
// Add our dependencies
var gulp = require('gulp');
var ts = require('gulp-typescript');
// var concat = require('gulp-concat'); // Gulp File concatenation plugin

// Configuration
var configuration = {
    paths: {
        src: {
            html: './src/*.html',
            css: [
                './src/css/bootstrap.min.css',
                './src/css/main.css'
            ],
            js: '/src/js/*.ts'
        },
        dist: './dist'
    }
};

// Gulp task to copy HTML files to output directory
gulp.task('html', function() {
    gulp.src(configuration.paths.src.html)
        .pipe(gulp.dest(configuration.paths.dist));
});

// Gulp task to concatenate our css files
gulp.task('css', function () {
   gulp.src(configuration.paths.src.css)
       .pipe(concat('site.css'))
       .pipe(gulp.dest(configuration.paths.dist + '/css'))
});

// get the typescript settings from tsconfig.json file
var tsProject = ts.createProject('tsconfig.json');

// uncomment next line to overwrite / add settings from tsconfig.json
// var tsProject = ts.createProject('tsconfig.json', { noImplicitAny: true });

gulp.task('tsc', function () {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist/js'));
});

// Gulp default task
gulp.task('default', ['html', 'tsc']);