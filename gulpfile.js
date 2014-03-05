var gulp = require('gulp'),
	compass = require('gulp-compass'),
	prefix = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');

var css_dir = 'css/',
	js_dir = 'js/';

var watchFiles = {
	js: ['js/jquery.min.js','js/bootstrap.min.js','js/main.js','js/knob.jquery.js','!js/app.js'],
	css: ['css/**/*.scss','css/main.scss']
};

gulp.task('default', function(){
	compile_css();
	compile_js();

	watch_css();
	watch_js();
});

function compile_css(){
	gulp.src(watchFiles.css).pipe(
		compass({
			sass: css_dir,
			css: css_dir,
			style: 'compressed'
		})
	)
	.pipe(prefix())
	.pipe(gulp.dest(css_dir));
}
function compile_js(){
	return gulp.src(watchFiles.js)
	.pipe(uglify())
	.pipe(concat('app.js'))
	.pipe(gulp.dest(js_dir));
}


function watch_css(){
	gulp.watch(watchFiles.css, function(event){
		console.log(event.path + ' changed');
		compile_css();
	});
}

function watch_js(){
	gulp.watch(watchFiles.js, function(event){
		console.log(event.path + ' changed');
		compile_js();
	});
}