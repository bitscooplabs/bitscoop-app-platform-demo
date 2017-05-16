'use strict';

const Chart = require('chart');
const $ = require('jquery');
const _ = require('lodash');
const moment = require('moment');
require('datetimepicker');


var apiUrl = 'https://85a76ibfti.execute-api.us-east-1.amazonaws.com/prod';
var githubUrl = apiUrl + '/github';
var googleUrl = apiUrl + '/google';
var postmanUrl = apiUrl + '/postman';
var statuscakeUrl = apiUrl + '/statuscake';

$(document).ready(function() {
	function getMetrics(startDate, endDate) {
		return Promise.all([
			new Promise(function(resolve) {
				$.ajax({
					url: githubUrl + '?startDate=' + startDate + '&endDate=' + endDate
				}).done(function(data) {
					resolve(data);
				}).fail(function() {
					resolve();
				});
			}),

			new Promise(function(resolve) {
				$.ajax({
					url: googleUrl + '?startDate=' + startDate + '&endDate=' + endDate
				}).done(function(data) {
					resolve(data);
				}).fail(function() {
					resolve();
				});
			}),

			new Promise(function(resolve) {
				$.ajax({
					url: postmanUrl + '?startDate=' + startDate + '&endDate=' + endDate
				}).done(function(data) {
					resolve(data);
				}).fail(function() {
					resolve();
				});
			}),

			new Promise(function(resolve) {
				$.ajax({
					url: statuscakeUrl + '?startDate=' + startDate + '&endDate=' + endDate
				}).done(function(data) {
					resolve(data);
				}).fail(function() {
					resolve();
				});
			})
		]);
	}

	function renderMetrics(results) {
		$('canvas').html('');
		$('iframe').remove();

		let dateIndex;
		let [githubResults, googleAnalyticsResults, postmanResults, statuscakeResults] = results;

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

		new Chart($('#issues-to-users'), {
			type: 'line',
			data: {
				labels: data.dates,
				datasets: [
					{
						label: 'GitHub Issues',
						data: data.issues,
						xAxisId: 'Date',
						yAxisId: 'GitHub Issues',
						lineTension: 0,
						backgroundColor: 'rgba(42, 193, 222, 0.2)'
					},
					{
						label: 'Total Users',
						data: data.totalUsers,
						xAxisId: 'Date',
						yAxisId: 'Total Users',
						lineTension: 0,
						backgroundColor: 'rgba(189, 44, 0, 0.2)'
					},
					{
						label: 'New Users',
						data: data.newUsers,
						xAxisId: 'Date',
						yAxisId: 'New Users',
						lineTension: 0,
						backgroundColor: 'rgba(255, 153, 51, 0.2)'
					}
				]
			}
		});

		new Chart($('#total-users-to-api-outages'), {
			type: 'line',
			data: {
				labels: data.dates,
				datasets: [
					{
						label: 'Total Users',
						data: data.totalUsers,
						xAxisId: 'Date',
						yAxisId: 'Total Users',
						lineTension: 0,
						backgroundColor: 'rgba(42, 193, 222, 0.2)'
					},
					{
						label: 'API Outages',
						data: data.outages,
						xAxisId: 'Date',
						yAxisId: 'API Outages',
						lineTension: 0,
						backgroundColor: 'rgba(255, 153, 51, 0.2)'
					}
				]
			}
		});

		new Chart($('#new-users-to-site-outages'), {
			type: 'line',
			data: {
				labels: data.dates,
				datasets: [
					{
						label: 'New Users',
						data: data.newUsers,
						xAxisId: 'Date',
						yAxisId: 'New Users',
						lineTension: 0,
						backgroundColor: 'rgba(42, 193, 222, 0.2)'
					},
					{
						label: 'Site Outages',
						data: data.outages,
						xAxisId: 'Date',
						yAxisId: 'Site Outages',
						lineTension: 0,
						backgroundColor: 'rgba(255, 153, 51, 0.2)'
					}
				]
			}
		});

		new Chart($('#api-outages-to-site-outages'), {
			type: 'line',
			data: {
				labels: data.dates,
				datasets: [
					{
						label: 'API outages',
						data: data.status,
						xAxisId: 'Date',
						yAxisId: 'API Outages',
						lineTension: 0,
						backgroundColor: 'rgba(42, 193, 222, 0.2)'
					},
					{
						label: 'Site Outages',
						data: data.outages,
						xAxisId: 'Date',
						yAxisId: 'Site Outages',
						lineTension: 0,
						backgroundColor: 'rgba(255, 153, 51, 0.2)'
					}
				]
			}
		});

		new Chart($('#api-outages-to-issues'), {
			type: 'line',
			data: {
				labels: data.dates,
				datasets: [
					{
						label: 'GitHub Issues',
						data: data.issues,
						xAxisId: 'Date',
						yAxisId: 'GitHub Issues',
						lineTension: 0,
						backgroundColor: 'rgba(42, 193, 222, 0.2)'
					},
					{
						label: 'API Outages',
						data: data.status,
						xAxisId: 'Date',
						yAxisId: 'API Outages',
						lineTension: 0,
						backgroundColor: 'rgba(255, 153, 51, 0.2)'
					}
				]
			}
		});
	}

	$('#start-date, #end-date').datetimepicker({
		format: 'YYYY-MM-DD',
		icons: {
			up: 'fa fa-chevron-up',
			down: 'fa fa-chevron-down',
			previous: 'fa fa-chevron-left',
			next: 'fa fa-chevron-right',
			time: 'fa fa-clock-o',
			date: 'fa fa-calendar'
		}
	});

	getMetrics(moment().utc().subtract(30, 'days').format('YYYY-MM-DD'), moment().utc().format('YYYY-MM-DD'))
		.then(renderMetrics);

	$(document).on('click', '.header button', function() {
		var start, end;

		start = $('#start-date input').val();
		end = $('#end-date input').val();

		getMetrics(start, end)
			.then(renderMetrics);
	});

	$('#start-date').on('dp.change', function(e) {
		$('#end-date').data('DateTimePicker').minDate(e.date);
	});

	$('#end-date').on('dp.change', function(e) {
		$('#start-date').data('DateTimePicker').maxDate(e.date);
	});
});
