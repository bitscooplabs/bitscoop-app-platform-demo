'use strict';

const assert = require('assert');

const Sequelize = require('sequelize');
const _ = require('lodash');
const moment = require('moment');


exports.handler = function(event, context, callback) {
	let start = event.startDate;
	let end = event.endDate;

	let startDate = start ? moment(start).format('YYYY-MM-DD') : moment().utc().subtract(1, 'month').format('YYYY-MM-DD');
	let endDate = end ? moment(end).format('YYYY-MM-DD') : moment().utc().format('YYYY-MM-DD');

	let sequelize;

	return Promise.resolve()
		.then(function() {
			try {
				assert(process.env.HOST != null, 'Unspecified RDS host.');
				assert(process.env.PORT != null, 'Unspecified RDS port.');
				assert(process.env.USER != null, 'Unspecified RDS user.');
				assert(process.env.PASSWORD != null, 'Unspecified RDS password.');
				assert(process.env.DATABASE != null, 'Unspecified RDS database.');
			} catch(err) {
				return Promise.reject(err);
			}

			sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
				host: process.env.HOST,
				port: process.env.PORT,
				dialect: 'mysql'
			});

			return Promise.resolve();
		})
		.then(function() {
			let promises = [];

			if (process.env.GOOGLE) {
				let googleAnalytics = sequelize.define('google_analytics', {
					id: {
						type: Sequelize.INTEGER,
						primaryKey: true,
						autoIncrement: true
					},
					date: {
						type: Sequelize.DATE
					},
					totalUsers: {
						type: Sequelize.INTEGER,
						field: 'total_users'
					},
					newUsers: {
						type: Sequelize.INTEGER,
						field: 'new_users'
					}
				}, {
					timestamps: false,
					freezeTableName: true
				});

				promises.push(
					googleAnalytics.findAll({
						where: {
							date: {
								$gte: startDate,
								$lte: endDate
							}
						}
					})
				);
			}
			else {
				promises.push(Promise.resolve());
			}

			if (process.env.STATUSCAKE) {
				let statuscake = sequelize.define('statuscake', {
					id: {
						type: Sequelize.INTEGER,
						primaryKey: true,
						autoIncrement: true
					},
					date: {
						type: Sequelize.DATE
					},
					outages: {
						type: Sequelize.INTEGER
					}
				}, {
					timestamps: false,
					freezeTableName: true
				});

				promises.push(
					statuscake.findAll({
						where: {
							date: {
								$gte: startDate,
								$lte: endDate
							}
						}
					})
				);
			}
			else {
				promises.push(Promise.resolve());
			}

			if (process.env.POSTMAN) {
				let postman = sequelize.define('postman', {
					id: {
						type: Sequelize.INTEGER,
						primaryKey: true,
						autoIncrement: true
					},
					date: {
						type: Sequelize.DATE
					},
					status: {
						type: Sequelize.BOOLEAN
					}
				}, {
					timestamps: false,
					freezeTableName: true
				});

				promises.push(
					postman.findAll({
						where: {
							date: {
								$gte: startDate,
								$lte: endDate
							}
						}
					})
				);
			}
			else {
				promises.push(Promise.resolve());
			}

			if (process.env.GITHUB) {
				let github = sequelize.define('github', {
					id: {
						type: Sequelize.INTEGER,
						primaryKey: true,
						autoIncrement: true
					},
					date: {
						type: Sequelize.DATE
					},
					issues: {
						type: Sequelize.INTEGER
					}
				}, {
					timestamps: false,
					freezeTableName: true
				});

				promises.push(
					github.findAll({
						where: {
							date: {
								$gte: startDate,
								$lte: endDate
							}
						}
					})
				);
			}
			else {
				promises.push(Promise.resolve());
			}

			if (promises.length === 0) {
				return Promise.resolve(new Error('You haven\'t configured any status checks'));
			}

			return Promise.all(promises);
		})
		.then(function(results) {
			let dateIndex;
			let [googleAnalyticsResults, statuscakeResults, postmanResults, githubResults] = results;

			dateIndex = {};

			let data = {
				dates: [],
				issues: [],
				newUsers: [],
				outages: [],
				status: [],
				totalUsers: []
			};

			_.each(githubResults, function(item) {
				var index;

				let date = moment(new Date(item.date));

				if (!dateIndex.hasOwnProperty(item.date)) {
					dateIndex[item.date] = data.dates.length;

					data.issues.push(item.issues);
					data.dates.push(date.format('MM/DD/YYYY'));
				}
				else {
					index = dateIndex[item.date];

					data.issues[index] = item.issues;
				}
			});

			_.each(googleAnalyticsResults, function(item) {
				var index;

				let date = moment(new Date(item.date));

				if (!dateIndex.hasOwnProperty(item.date)) {
					dateIndex[item.date] = data.dates.length;

					data.newUsers.push(item.newUsers);
					data.totalUsers.push(item.totalUsers);
					data.dates.push(date.format('MM/DD/YYYY'));
				}
				else {
					index = dateIndex[item.date];

					data.newUsers[index] = item.newUsers;
					data.totalUsers[index] = item.totalUsers;
				}
			});

			_.each(postmanResults, function(item) {
				var index;

				let date = moment(new Date(item.date));

				if (!dateIndex.hasOwnProperty(item.date)) {
					dateIndex[item.date] = data.dates.length;

					data.status.push(item.status ? 1 : 0);
					data.dates.push(date.format('MM/DD/YYYY'));
				}
				else {
					index = dateIndex[item.date];

					data.status[index] = item.status ? 1 : 0;
				}
			});

			_.each(statuscakeResults, function(item) {
				var index;

				let date = moment(new Date(item.date));

				if (!dateIndex.hasOwnProperty(item.date)) {
					dateIndex[item.date] = data.dates.length;

					data.outages.push(item.outages);
					data.dates.push(date.format('MM/DD/YYYY'));
				}
				else {
					index = dateIndex[item.date];

					data.outages[index] = item.outages;
				}
			});

			return Promise.resolve(data);
		})
		.then(function(data) {
			console.log('SUCCESSFUL');
			sequelize.close();

			callback(null, data);

			return Promise.resolve();
		})
		.catch(function(err) {
			console.log('UNSUCCESSFUL');

			if (sequelize) {
				sequelize.close();
			}

			return Promise.reject(err);
		});
};
