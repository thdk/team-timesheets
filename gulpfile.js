
// Add dependencies
const gulp = require('gulp');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript');
const sass = require('gulp-sass');
const resolve = require('rollup-plugin-node-resolve');
const commonJS = require('rollup-plugin-commonjs');

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

// based on example from https://rollupjs.org/guide/en (See Gulp section)
gulp.task('tsc', () => {
    return rollup.rollup({
        input: configuration.paths.src.js,
        // external: ['firebase', 'pubsub-js'],
        plugins: [
            typescript() // uses tsconfig.json, overwrite using: typescript({lib: ["es5", "es6", "dom"], target: "es5"})
        ]
    }).then(bundle => {
        return bundle.write({
            file: 'dist/js/app.js',
            format: 'iife',
            name: 'rollupBundle',
            plugins: [
                resolve(),
                commonJS({
                    include: 'node_modules/**'
                })
            ],
            //   globals: {
            //     'firebase': 'firebase',
            //     'pubsub-js': 'PubSub'
            //   }
        });
    });
});

gulp.task('tsc:watch', function () {
    gulp.watch('./src/**/*.ts', ['tsc']);
});

// Gulp default task
gulp.task('default', ['html', 'tsc', 'scss']);

gulp.task('watch', ['tsc:watch', 'scss:watch']);