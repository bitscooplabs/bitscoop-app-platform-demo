'use strict';

const gulp = require('gulp');
const sequence = require('run-sequence');


let pkg = require('./package.json');
let banner = '/**\n * Copyright (c) ${new Date().getFullYear()} ${pkg.author}\n * All rights reserved.\n */\n';

let date = new Date().getTime();


gulp.task('default', function(done) {
	sequence('devel', 'watch', done);
});


gulp.task('build', function(done) {
	sequence('lint', 'clean', ['copy:assets', 'copy:templates', 'less', 'uglify'], 'snapshot', done);
});


gulp.task('build:individual', function(done) {
	sequence('lint', 'clean', ['copy:assets', 'copy:templates', 'less', 'uglify:individual'], 'snapshot', done);
});


gulp.task('bundle', function() {
	const path = require('path');

	const zip = require('gulp-zip');
	const rename = require('gulp-rename');

	let basename = path.basename(process.cwd());
	let renameExpression = new RegExp('^' + basename);

	return gulp.src([
		'src/index.js',
		'src/node_modules/**',
		'src/package.json'
	])
		.pipe(rename(function(path) {
			path.dirname = path.dirname.replace(renameExpression, pkg.name);

			return path;
		}))
		.pipe(zip(pkg.name + '-' + pkg.version + '.zip'))
		.pipe(gulp.dest('dist'));
});


gulp.task('bundle:individual', function(done) {
	sequence('lint', ['bundle:github', 'bundle:google', 'bundle:postman', 'bundle:statuscake'], done);
});


gulp.task('bundle:github', function() {
	const path = require('path');

	const zip = require('gulp-zip');
	const rename = require('gulp-rename');

	let basename = path.basename(process.cwd());
	let renameExpression = new RegExp('^' + basename);

	return gulp.src([
		'src/views/github/index.js',
		'src/node_modules/**',
		'src/package.json'
	])
		.pipe(rename(function(path) {
			path.dirname = path.dirname.replace(renameExpression, pkg.name);

			return path;
		}))
		.pipe(zip(pkg.name + '-github-' + pkg.version + '.zip'))
		.pipe(gulp.dest('dist'));
});


gulp.task('bundle:google', function() {
	const path = require('path');

	const zip = require('gulp-zip');
	const rename = require('gulp-rename');

	let basename = path.basename(process.cwd());
	let renameExpression = new RegExp('^' + basename);

	return gulp.src([
		'src/views/google/index.js',
		'src/node_modules/**',
		'src/package.json'
	])
		.pipe(rename(function(path) {
			path.dirname = path.dirname.replace(renameExpression, pkg.name);

			return path;
		}))
		.pipe(zip(pkg.name + '-google-' + pkg.version + '.zip'))
		.pipe(gulp.dest('dist'));
});


gulp.task('bundle:postman', function() {
	const path = require('path');

	const zip = require('gulp-zip');
	const rename = require('gulp-rename');

	let basename = path.basename(process.cwd());
	let renameExpression = new RegExp('^' + basename);

	return gulp.src([
		'src/views/postman/index.js',
		'src/node_modules/**',
		'src/package.json'
	])
		.pipe(rename(function(path) {
			path.dirname = path.dirname.replace(renameExpression, pkg.name);

			return path;
		}))
		.pipe(zip(pkg.name + '-postman-' + pkg.version + '.zip'))
		.pipe(gulp.dest('dist'));
});


gulp.task('bundle:statuscake', function() {
	const path = require('path');

	const zip = require('gulp-zip');
	const rename = require('gulp-rename');

	let basename = path.basename(process.cwd());
	let renameExpression = new RegExp('^' + basename);

	return gulp.src([
		'src/views/statuscake/index.js',
		'src/node_modules/**',
		'src/package.json'
	])
		.pipe(rename(function(path) {
			path.dirname = path.dirname.replace(renameExpression, pkg.name);

			return path;
		}))
		.pipe(zip(pkg.name + '-statuscake-' + pkg.version + '.zip'))
		.pipe(gulp.dest('dist'));
});


gulp.task('clean', function() {
	const clean = require('gulp-clean');

	return gulp.src([
		'artifacts/',
		'dist/',
		'dump/'
	], {
		read: false
	})
		.pipe(clean({
			force: true
		}));
});


gulp.task('copy:assets', function() {
	return gulp.src([
		'static/**/*',
		'!static/**/*.js',
		'!static/**/*.less'
	], {
		nodir: true
	})
		.pipe(gulp.dest('artifacts/'));
});


gulp.task('copy:templates', function() {
	return gulp.src([
		'templates/**'
	])
		.pipe(gulp.dest('dist/' + date + '/'))
});


gulp.task('devel', function(done) {
	sequence('clean', ['copy:assets', 'copy:templates', 'less', 'uglify:devel'], done);
});


gulp.task('less', function() {
	const LessAutoPrefix = require('less-plugin-autoprefix');
	const cleanCSS = require('gulp-clean-css');
	const header = require('gulp-header');
	const less = require('gulp-less');
	const rename = require('gulp-rename');

	return gulp.src([
		'static/less/site.less'
	])
		.pipe(less({
			plugins: [
				new LessAutoPrefix({
					browsers: ['last 3 versions', 'ie 11', 'ie 10']
				})
			]
		}))
		.pipe(cleanCSS())
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(gulp.dest('artifacts/css'));
});


gulp.task('lint', ['lint:js', 'lint:json']);


gulp.task('lint:js', function() {
	const eslint = require('gulp-eslint');

	return gulp.src([
		'*.js',
		'lib/**/*.js',
		'migrations/**/*.js',
		'scripts/**/*.js',
		'static/**/*.js',
		'test/**/*.js',
		'!static/lib/**/*.js'
	])
		.pipe(eslint({
			configFile: 'eslint.json'
		}))
		.pipe(eslint.formatEach());
});


gulp.task('lint:json', function() {
	const jsonlint = require('gulp-jsonlint');

	return gulp.src([
		'*.json',
		'config/*.json',
		'fixtures/**/*.json',
		'schemas/**/*.json'
	])
		.pipe(jsonlint())
		.pipe(jsonlint.failOnError())
		.pipe(jsonlint.reporter());
});


gulp.task('lint:less', function() {
	const lesshint = require('gulp-lesshint');

	return gulp.src([
		'static/**/*.less'
	])
		.pipe(lesshint())
		.pipe(lesshint.failOnError())
		.pipe(lesshint.reporter());
});


gulp.task('snapshot', function() {
	return gulp.src([
		'artifacts/**'
	])
		.pipe(gulp.dest('dist/' + date + '/static/'));
});


gulp.task('uglify', function() {
	const addsrc = require('gulp-add-src');
	const babel = require('gulp-babel');
	const header = require('gulp-header');
	const rename = require('gulp-rename');
	const uglify = require('gulp-uglify');

	return gulp.src([
		'static/**/*.js',
		'!static/js/site2.js',
		'!static/lib/requirejs/**/*.js'
	])
		.pipe(babel({
			presets: ['es2015'],
			plugins: ['transform-es2015-modules-amd']
		}))
		.pipe(addsrc([
			'static/lib/requirejs/**/*.js'
		], {
			base: 'static'
		}))
		.pipe(uglify())
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('artifacts'));
});


gulp.task('uglify:individual', function() {
	const addsrc = require('gulp-add-src');
	const babel = require('gulp-babel');
	const header = require('gulp-header');
	const rename = require('gulp-rename');
	const uglify = require('gulp-uglify');

	return gulp.src([
		'static/**/*.js',
		'!static/js/site.js',
		'!static/lib/requirejs/**/*.js'
	])
		.pipe(babel({
			presets: ['es2015'],
			plugins: ['transform-es2015-modules-amd']
		}))
		.pipe(addsrc([
			'static/lib/requirejs/**/*.js'
		], {
			base: 'static'
		}))
		.pipe(rename(function(path) {
			if (path.basename === 'site2') {
				path.basename = 'site'
			}
		}))
		.pipe(uglify())
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('artifacts'));
});


gulp.task('uglify:devel', function() {
	const addsrc = require('gulp-add-src');
	const babel = require('gulp-babel');
	const rename = require('gulp-rename');

	return gulp.src([
		'static/**/*.js',
		'!static/lib/requirejs/**/*.js'
	])
		.pipe(babel({
			presets: ['es2015'],
			plugins: ['transform-es2015-modules-amd']
		}))
		.pipe(addsrc([
			'static/lib/requirejs/**/*.js'
		], {
			base: 'static'
		}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('artifacts'));
});


gulp.task('watch', function() {
	gulp.watch([
		'static/**/*.js'
	], ['uglify:devel'])
		.on('error', function() {
			this.emit('end');
		});

	gulp.watch([
		'static/**/*.less'
	], ['less'])
		.on('error', function() {
			this.emit('end');
		});
});
