'use strict';

const Chart = require('chart');
const $ = require('jquery');
const moment = require('moment');


$(document).ready(function() {
	function getMetrics(startDate, endDate) {
		return new Promise(function(resolve) {
			$.ajax({
				url: 'https://localhost:8002/data?startDate=' + startDate + '&endDate=' + endDate
			}).done(function(data) {
				resolve(data);
			});
		});
	}

	function renderMetrics(data) {
		var chartsHTML, textHTML;

		chartsHTML = nunjucks.render('charts.html');

		$('.charts').html(chartsHTML);

		new Chart($('#issues-to-new-users'), {
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
						backgroundColor: '#2AC1DE'
					},
					{
						label: 'New Users',
						data: data.newUsers,
						xAxisId: 'Date',
						yAxisId: 'New Users',
						lineTension: 0,
						backgroundColor: '#FF9933'
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
						backgroundColor: '#2AC1DE'
					},
					{
						label: 'API Outages',
						data: data.outages,
						xAxisId: 'Date',
						yAxisId: 'API Outages',
						lineTension: 0,
						backgroundColor: '#FF9933'
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
						backgroundColor: '#2AC1DE'
					},
					{
						label: 'Site Outages',
						data: data.outages,
						xAxisId: 'Date',
						yAxisId: 'Site Outages',
						lineTension: 0,
						backgroundColor: '#FF9933'
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
						data: data.status === true ? 1 : 0,
						xAxisId: 'Date',
						yAxisId: 'API Outages',
						lineTension: 0,
						backgroundColor: '#2AC1DE'
					},
					{
						label: 'Site Outages',
						data: data.outages,
						xAxisId: 'Date',
						yAxisId: 'Site Outages',
						lineTension: 0,
						backgroundColor: '#FF9933'
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
						backgroundColor: '#2AC1DE'
					},
					{
						label: 'API Outages',
						data: data.outages === true ? 1 : 0,
						xAxisId: 'Date',
						yAxisId: 'API Outages',
						lineTension: 0,
						backgroundColor: '#FF9933'
					}
				]
			}
		});

		textHTML = nunjucks.render('components/metrics.html', {
			metrics: data.totals
		});

		$('.metrics-text .render').html(textHTML);
	}

	getMetrics(moment().utc().format('YYYY-MM-DD'), moment().utc().subtract(30, 'days').format('YYYY-MM-DD'))
		.then(renderMetrics);
});
