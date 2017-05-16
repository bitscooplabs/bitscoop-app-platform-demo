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

			return statuscake.findAll({
				where: {
					date: {
						$gte: startDate,
						$lte: endDate
					}
				}
			});
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
