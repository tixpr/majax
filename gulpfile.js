var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');

gulp.task('dev', function () {
	return gulp.src('src/*.js')
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(gulp.dest('dev'))
});

gulp.task('build', function () {
	return gulp.src('src/*.js')
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(uglify())
		.pipe(gulp.dest('lib'))
});