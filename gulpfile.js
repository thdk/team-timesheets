
// Add dependencies
const gulp = require('gulp');
const sass = require('gulp-sass');
const rev = require('gulp-rev');
const buffer = require('gulp-buffer');
const inject = require('gulp-inject');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

// Configuration
const configuration = {
    paths: {
        src: {
            images: './src/images/**/*.png',
            css: [
                './src/style/*.scss',
                './src/components/**/*.scss',
                './src/containers/**/*.scss',
                './src/pages/**/*.scss',
            ],
        },
        dist: './dist',
        node_modules: './node_modules/'
    }
};

// Gulp task to concatenate our scss files
gulp.task('scss', gulp.series(() => {
    return gulp.src(configuration.paths.src.css)
        .pipe(sass({
            includePaths: ['node_modules/'] // added includePaths to resolve scss partials from node modules
        }).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulp.dest(configuration.paths.dist + '/css'));
}));

gulp.task('inject-css', function () {
    const cssStream = gulp.src([
        './dist/**/*.css'
    ], { read: false });

    return gulp.src('./dist/index.html')
        .pipe(inject(cssStream
            , {
                ignorePath: 'dist',
                addRootSlash: true,
                relative: false,
            }))
        .pipe(gulp.dest('./dist'));
});
