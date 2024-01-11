'use strict';

const winston = require('winston');
const util = require('util');

let alignColorsAndTime = winston.format.combine(
	winston.format.colorize({
		all: true
	}),
	winston.format.timestamp({
		format: 'DD-MM-YY HH:mm:ss'
	}),
	winston.format.printf(
		info => `${info.timestamp} ${info.level} : ${info.message}`
	)
);

const logger = winston.createLogger({
	format: winston.format.json(),
	defaultMeta: { service: 'API' },
	levels: winston.config.syslog.levels,
	transports: [
		/**
		 * - Write all logs with importance level of `error` or less to `error.log`
		 * - Write all logs with importance level of `info` or less to `combined.log`
		 */
		new winston.transports.File({ filename: 'error.log', level: 'error' }),
		new winston.transports.File({ filename: 'combined.log' }),
	]
});

/**
 * If we're not in production then log to the `console` with the format:
 * `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
 */
if (process.env.NODE_ENV !== 'production') {
	
	logger.add(new (winston.transports.Console)({
		format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
	}));
}

// pass in function arguments object and returns string with whitespaces
function argumentsToString(v) {

	// convert arguments object to real array
	var args = Array.prototype.slice.call(v);

	for (var k in args) {

		if (typeof args[k] === 'object') {

			// args[k] = JSON.stringify(args[k]);
			args[k] = util.inspect(args[k], false, null, true);
		}
	}

	var str = args.join(" ");

	return str;
}

// wrapping the winston function to allow for multiple arguments
var wrap = {};

wrap.crit = function () {
	logger.log.apply(logger, ['crit', argumentsToString(arguments)]);
};

wrap.error = function () {
	logger.log.apply(logger, ['error', argumentsToString(arguments)]);
};

wrap.info = function () {
	logger.log.apply(logger, ['info', argumentsToString(arguments)]);
};

module.exports = wrap;