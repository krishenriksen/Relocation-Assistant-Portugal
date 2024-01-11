'use strict';

const GPT3 = require(`./gpt3.js`);

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

	process = async function(req, res) {

		const response = req.body;

		if (response.object === 'page') {

			let msgObject = self.getMessageObject(response);

			// generate response from GPT-3 and send to Facebook
			await new GPT3().response(msgObject.id, msgObject.message);
		}

		// 200 OK
		return res.status(200).json({
			message: 'OK'
		});
	}

	getMessageObject = function(json) {

        const message = json.entry[0].messaging[0].message.text
        const id = json.entry[0].messaging[0].sender.id
        return {message, id};
	}
}

module.exports = MessengerController;