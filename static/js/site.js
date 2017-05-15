'use strict';

const Chart = require('chart');
const $ = require('jquery');
const moment = require('moment');
require('datetimepicker');


var apiUrl = '';

$(document).ready(function() {
	function getMetrics(startDate, endDate) {
		return new Promise(function(resolve) {
			$.ajax({
				url: apiUrl + '?startDate=' + startDate + '&endDate=' + endDate
			}).done(function(data) {
				resolve(data);
			});
		});
	}

	function renderMetrics(data) {
		$('canvas').html('');
		$('iframe').remove();

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
