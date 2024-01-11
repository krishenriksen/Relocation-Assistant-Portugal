'use strict';

var self;

class MessengerController {

	constructor(logger) {

		this.logger = logger;

		self = this;
	}

	/**
	 * Subscribe the user
	 * @author Kris Henriksen
	 * @param {Object} req Browser request
	 * @param {Object} res Response to browser
	 * @returns JSON Object
	 */
	subscribe = function(req, res) {

		if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] == process.env.FACEBOOK_VERIFY_TOKEN) {

			return res.end(req.query['hub.challenge']);
		}

		// 418 I'm a teapot
		return res.status(418).json({
			message: 'The server refuses the attempt to brew coffee with a teapot..'
		});
	}

	process = function(req, res) {

		const response = req.body;

		console.log(response);

		// 200 OK
		return res.status(200).json({
			message: 'OK'
		});
	}
}

module.exports = MessengerController;