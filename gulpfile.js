var gulp = require('gulp');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var htmlmin = require('gulp-htmlmin');
var ngHtml2js = require('gulp-ng-html2js');
var ngAnnotate = require('gulp-ng-annotate'),
    minifyCss    = require('gulp-minify-css'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat');

var buildPath = './build';
var distPath = './dist';

var htmlminOption = {
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeComments: true,
    //removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyJS: true,
    minifyCSS: true
};

gulp.task('build', ['build-copy', 'build-sass', 'build-js', 'build-html']);

gulp.task('build-copy', function() {
    return gulp.src(['src/*.*', 'src/assets/**/*'])
        .pipe(gulp.dest(buildPath));
});

gulp.task('build-sass', function() {
    return gulp.src('src/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(buildPath + '/css'));
});

gulp.task('build-js', function() {
    return gulp.src('src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(ngAnnotate({single_quotes: true}))
        .pipe(gulp.dest(buildPath + '/js'));
});

// gulp.task('build-html', function() {
//     return gulp.src('src/js/*.html')
//         .pipe(htmlmin(htmlminOption))
//         .pipe(ngHtml2js({
//             moduleName: "eqx.colorpicker.tpl"
//         }))
//         .pipe(gulp.dest(buildPath + '/js'));
// });

gulp.task('watch', ['build'], function() {
    gulp.watch(['src/*.*', 'src/assets/**/*'], ['build-copy']);
    gulp.watch('src/js/**/*.js', ['build-js']);
    gulp.watch('src/sass/**/*.scss', ['build-sass']);
    // gulp.watch('src/js/**/*.html', ['build-html']);
});

gulp.task('compile-js', function() {
    return gulp.src([buildPath + '/js/bootstrap-colorpicker.js', buildPath + '/js/eqdColorpicker.js'])
        .pipe(concat('eqx-colorpicker.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(distPath + '/js'));
});