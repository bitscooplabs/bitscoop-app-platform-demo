'use strict';

const moment = require('moment');


module.exports = function(value) {
	var parsedValue = moment(new Date(value));

	return moment(parsedValue).fromNow();
};
