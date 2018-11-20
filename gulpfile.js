
// Add dependencies
const gulp = require('gulp');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript');
const sass = require('gulp-sass');
const resolve = require('rollup-plugin-node-resolve');
const commonJS = require('rollup-plugin-commonjs');
const replace = require("rollup-plugin-replace");

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

// based on example from https://rollupjs.org/guide/en (See Gulp section)
gulp.task('tsc', () => {
    return rollup.rollup({
        input: configuration.paths.src.js,
        external: ["firebase/app"],
        plugins: [
            replace({
                'process.env.NODE_ENV': "'development'"
              }),
            resolve(),
            commonJS({
                include: 'node_modules/**',
                namedExports: {
                  'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement', 'forwardRef'],
                  'node_modules/react-dom/index.js': ['findDOMNode', 'unstable_batchedUpdates', 'render']
                }
              }),
            typescript(), // uses tsconfig.json, overwrite using: typescript({lib: ["es5", "es6", "dom"], target: "es5"}))
        ]
    }).then(bundle => {
        return bundle.write({
            file: 'dist/js/app.js',
            format: 'iife',
            name: 'rollupBundle'
        });
    });
});

gulp.task('tsc:watch', gulp.series(function (done) {
    gulp.watch(['./src/**/*.ts','./src/**/*.tsx'] , gulp.series('tsc'));
    done();
}));

// Gulp default task
gulp.task('default', gulp.parallel(['html', 'tsc', 'scss']));

gulp.task('watch', gulp.parallel(['tsc:watch', 'scss:watch']));