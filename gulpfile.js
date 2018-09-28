
// Add dependencies
var gulp = require('gulp');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript');

var sass = require('gulp-sass');

// Configuration
var configuration = {
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
gulp.task('html', function () {
    gulp.src(configuration.paths.src.html)
        .pipe(gulp.dest(configuration.paths.dist));
});

// Gulp task to concatenate our scss files
gulp.task('scss', function () {
    gulp.src(configuration.paths.src.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(configuration.paths.dist + '/css'))
});

gulp.task('scss:watch', function () {
    gulp.watch('./src/style/**/*.scss', ['scss']);
})

gulp.task('tsc', () => {
    return rollup.rollup({
        input: configuration.paths.src.js,
        plugins: [
            typescript() // uses tsconfig.json, overwrite using: typescript({lib: ["es5", "es6", "dom"], target: "es5"})
        ]
    }).then(bundle => {
        return bundle.write({
            file: 'dist/js/app.js',
            format: 'iife',
            name: 'rollupBundle'
        });
    });
});

gulp.task('tsc:watch', function () {
    gulp.watch('./src/**/*.ts', ['tsc']);
});

// Gulp default task
gulp.task('default', ['html', 'tsc', 'scss']);

gulp.task('watch', ['tsc:watch', 'scss:watch']);