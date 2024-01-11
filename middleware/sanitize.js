'use strict';

// standalone module that sanitizes inputs against query selector injection attacks:
const mongoSanitize = require('mongo-sanitize');

/**
* for the passionately lazy
* @author   Kris Henriksen
* @param    {Object} req    Browser request
* @param    {Object} res    Response to browser
* @param    {Object} next   Next function
*/
const sanitize = (req, res, next) => {

	req.headers = mongoSanitize(req.headers);
	req.body = mongoSanitize(req.body);
	req.params = mongoSanitize(req.params);
	req.file = mongoSanitize(req.file);

	next();
};

module.exports = sanitize;