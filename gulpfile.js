
// Add dependencies
const gulp = require('gulp');
const rollup = require('rollup-stream');
const sass = require('gulp-sass');
const rev = require('gulp-rev');
const buffer = require('gulp-buffer');
const inject = require('gulp-inject');
const del = require('del');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const source = require('vinyl-source-stream');

const argv = require('minimist')(process.argv.slice(2));

// Configuration
const configuration = {
    paths: {
        src: {
            html: './src/*.html',
            images: './src/images/**/*.png',
            css: [
                './src/style/*.scss'
            ],
            js: 'src/app.ts',
            manifest: 'src/manifest.json',
            browserconfig: 'src/browserconfig.xml',
            safari: 'src/images/icons/safari-pinned-tab.svg',
            favicon: './src/images/icons/favicon.ico',
        },
        dist: './dist'
    }
};

gulp.task('root', function() {
    return gulp.src([
        configuration.paths.src.manifest,
        configuration.paths.src.browserconfig,
        configuration.paths.src.safari,
        configuration.paths.src.favicon
    ])
        .pipe(gulp.dest(configuration.paths.dist));
});

gulp.task('images', function() {
    return gulp.src(configuration.paths.src.images)
        .pipe(gulp.dest(configuration.paths.dist + '/images'));
});

// Gulp task to concatenate our scss files
gulp.task('scss', gulp.series(function (done) {
    gulp.src(configuration.paths.src.css)
        .pipe(sass({
            includePaths: ['node_modules/'] // added includePaths to resolve scss partials from node modules
        }).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulp.dest(configuration.paths.dist + '/css'))
    done();
}));

gulp.task('scsswatch', gulp.series(function (done) {
    gulp.watch('./src/style/**/*.scss', gulp.series('clean-css', 'scss', 'inject'));
    done();
}));

gulp.task('bundle', function () {
    return rollup('rollup.config.js')
        .pipe(source("app.js")) // name of the output file
        .pipe(buffer()) // rev() doesn't support rollup stream, needs to buffer first
        .pipe(rev())
        .pipe(gulp.dest('dist/js')); // location to put the output file
});

gulp.task('tswatch', gulp.series(function (done) {
    gulp.watch(['./src/**/*.ts', './src/**/*.tsx'], gulp.series('clean-js', 'bundle', 'inject'));
    done();
}));

gulp.task('inject', function (done) {
    gulp.src('./src/**/*.html')
        .pipe(inject(gulp.src(['./dist/**/*.js', './dist/**/*.css'], { read: false }), {
            ignorePath: 'dist',
            addRootSlash: true,
            relative: false
        }))
        .pipe(gulp.dest('./dist'));
    done();
});

gulp.task('clean-js', function (cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['dist/js'], cb);
});

gulp.task('clean-css', function (cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['dist/js'], cb);
});

gulp.task('clean-dist', function (cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['dist'], cb);
});

gulp.task('set-node-env', function(done) {
    process.env.NODE_ENV = argv.env;
    done();
});

// Gulp default task
gulp.task('default', gulp.series(
    gulp.parallel('clean-dist', 'set-node-env'),
    gulp.parallel('bundle', 'scss'),
    gulp.parallel('inject', 'root', 'images')
));

gulp.task('watch', gulp.series('default', gulp.parallel('tswatch', 'scsswatch')));