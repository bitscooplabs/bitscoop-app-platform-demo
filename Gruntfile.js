'use strict';

const path = require('path');

let date = new Date().getTime();


module.exports = function(grunt) {
	grunt.initConfig({
		package: grunt.file.readJSON('package.json'),
		banner: '/**\n * @license\n * Copyright (c) <%= grunt.template.today("yyyy") %> BitScoop Labs, Inc.\n * All rights reserved.\n */',

		clean: {
			artifacts: 'artifacts',
			dist: 'dist',
			dump: 'dump',
			predeploy: [
				'artifacts/**/*.{css,js,less}',
				'!artifacts/**/*.min.{css,js}'
			]
		},

		cleanempty: {
			target: {
				options: {
					files: false
				},
				src: 'artifacts/**/*'
			}
		},

		compress: {
			main: {
				options: {
					archive: 'dist/<%= package.name %>-<%= package.version %>.tar.gz'
				},
				expand: true,
				src: [
					'config/**/*',
					'fixtures/**/*',
					'lib/**/*',
					'migrations/**/*',
					'pki/**/*',
					'scripts/**/*',
					'schemas/**/*',
					'templates/**/*',
					'LICENSE',
					'package.json',
					'app.js'
				],
				dest: '<%= package.name %>'
			}
		},

		copy: {
			collectstatic: {
				files: [
					{
						expand: true,
						cwd: 'static/',
						src: '**',
						dest: 'artifacts/'
					}
				]
			},

			deploy: {
				files: [
					{
						expand: true,
						cwd: 'artifacts/',
						src: '**',
						dest: 'dist/' + date + '/static/'
					},
					{
						expand: true,
						cwd: '',
						src: 'index.html',
						dest: 'dist/' + date
					},
					{
						expand: true,
						cwd: '',
						src: 'error.html',
						dest: 'dist/' + date
					}
				]
			},

			minify: {
				files: [
					'<%= cssmin.target.files %>',
					'<%= uglify.target.files %>'
				]
			}
		},

		cssmin: {
			target: {
				files: [
					{
						expand: true,
						cwd: 'artifacts/',
						src: '**/*.css',
						dest: 'artifacts/',
						ext: '.min.css'
					}
				]
			}
		},

		eslint: {
			all: {
				options: {
					configFile: 'eslint.json'
				},
				src: [
					'Gruntfile.js',
					'src/**/*.js',
					'!src/node_modules/**/*.js'
				]
			}
		},

		jsonlint: {
			eslint: {
				src: 'eslint.json'
			},
			fixtures: {
				src: 'fixtures/**/*.json'
			},
			package: {
				src: [
					'package.json',
					'src/package.json'
				]
			}
		},

		less: {
			target: {
				options: {
					paths: ['artifacts/'],
					plugins: [
						new (require('less-plugin-autoprefix'))({
							browsers: ['last 3 versions', 'ie 11', 'ie 10']
						})
					]
				},
				files: {
					'artifacts/css/site.css': 'artifacts/less/site.less'
				}
			}
		},

		nunjucks: {
			target: {
				src: [
					'nunjucks/**/*.html'
				],
				dest: 'artifacts/js/templates.js',
				options: {
					env: (function(nunjucks) {
						var environment;

						environment = new nunjucks.Environment();

						environment.addFilter('get', function() {});
						environment.addFilter('date', function() {});
						environment.addFilter('fileSize', function() {});

						return environment;
					})(require('nunjucks')),

					name: (function() {
						var delimiter, names;

						delimiter = 'nunjucks' + path.sep;
						names = {};

						return function(filename) {
							var i, template;

							if (~(i = filename.indexOf(delimiter))) {
								template = filename.slice(i + delimiter.length);
							}

							template = template.replace(new RegExp(path.sep, 'g'), '/');

							if (names.hasOwnProperty(template)) {
								grunt.log.warn('Name collison on nunjucks template "' + template + '":\n\tOld: ' + names[template] + '\n\tNew: ' + filename);
							}

							names[template] = filename;

							return template;
						};
					})()
				}
			}
		},

		uglify: {
			target: {
				files: [
					{
						expand: true,
						cwd: 'artifacts/',
						src: '**/*.js',
						dest: 'artifacts/',
						ext: '.min.js'
					}
				]
			}
		},

		usebanner: {
			target: {
				options: {
					position: 'top',
					banner: '<%= banner %>'
				},
				files: {
					src: 'artifacts/**/*.{css,js}'
				}
			}
		},

		watch: {
			nunjucks: {
				files: '<%= nunjucks.target.src %>',
				tasks: ['nunjucks', 'copy:minify']
			},

			static: {
				files: [
					'static/**/*.{js,css,less}'
				],
				tasks: ['copy:collectstatic', 'less', 'copy:minify']
			}
		}
	});

	// Load grunt tasks from NPM packages
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('build', [
		'jsonlint',
		'eslint',
		'lint',
		'clean:artifacts',
		'copy:collectstatic',
		'less',
		'nunjucks',
		'cssmin',
		'uglify',
		'clean:predeploy',
		'cleanempty',
		'usebanner',
		'copy:deploy',
		'compress'
	]);

	grunt.registerTask('cleanbuild', [
		'clean',
		'build'
	]);

	grunt.registerTask('devel', [
		'clean:artifacts',
		'copy:collectstatic',
		'less',
		'nunjucks',
		'copy:minify',
		'clean:predeploy',
		'cleanempty'
	]);

	grunt.registerTask('lint', [
		'jsonlint',
		'eslint'
	]);

	grunt.registerTask('default', [
		'build'
	]);
};
