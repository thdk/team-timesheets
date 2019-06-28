
// Add dependencies
const gulp = require('gulp');
const rollup = require('rollup-stream');
const sass = require('gulp-sass');
const rev = require('gulp-rev');
const series = require('stream-series');
const buffer = require('gulp-buffer');
const inject = require('gulp-inject');
const del = require('del');
const merge = require("merge-stream");

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
                './src/style/*.scss',
                './src/components/**/*.scss'
            ],
            js: 'src/app.ts',
            manifest: 'src/manifest.json',
            browserconfig: 'src/browserconfig.xml',
            safari: 'src/images/icons/safari-pinned-tab.svg',
            favicon: './src/images/icons/favicon.ico',
        },
        dist: './dist',
        node_modules: './node_modules/'
    }
};

gulp.task('root', function () {
    return gulp.src([
        configuration.paths.src.manifest,
        configuration.paths.src.browserconfig,
        configuration.paths.src.safari,
        configuration.paths.src.favicon
    ])
        .pipe(gulp.dest(configuration.paths.dist));
});

gulp.task('images', function () {
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
    gulp.watch(configuration.paths.src.css, gulp.series('clean-css', 'scss', 'inject'));
    done();
}));

gulp.task('clean:libs', gulp.series(function (done) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del([configuration.paths.dist + "/lib"], done);
}));

gulp.task("copy:libs", gulp.series("clean:libs", function () {
    const production = process.env.NODE_ENV === "production";
    const mobxLib = production ? "mobx/lib/mobx.umd.min.js" : "mobx/lib/mobx.umd.js"
    const momentLib = production ? "moment/min/moment.min.js" : "moment/moment.js";
    const chartjsLib = production ? "chart.js/dist/Chart.min.js" : "chart.js/dist/Chart.js"
    const libs = [];

    libs.push(
        gulp.src(configuration.paths.node_modules + momentLib)
            .pipe(gulp.dest(configuration.paths.dist + "/lib/moment")),
        gulp.src(configuration.paths.node_modules + chartjsLib)
            .pipe(gulp.dest(configuration.paths.dist + "/lib/chartjs")),
        gulp.src(configuration.paths.node_modules + mobxLib)
            .pipe(gulp.dest(configuration.paths.dist + "/lib/mobx"))
    );

    return merge(...libs);
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
    const appStream = gulp.src(['./dist/**/*.js',
        './dist/**/*.css'], { read: false });

    const vendorStream = gulp.src([
        './dist/lib/**/*.js'], { read: false });

    gulp.src('./src/**/*.html')
        .pipe(inject(series(vendorStream, appStream)
            , {
                ignorePath: 'dist',
                addRootSlash: true,
                relative: false,
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

gulp.task('set-node-env', function (done) {
    process.env.NODE_ENV = argv.env;
    done();
});

// Gulp default task
gulp.task('default', gulp.series(
    gulp.parallel('clean-dist', 'set-node-env'),
    gulp.parallel('bundle', 'scss', 'copy:libs'),
    gulp.parallel('inject', 'root', 'images')
));

gulp.task('watch', gulp.series('default', gulp.parallel('tswatch', 'scsswatch')));