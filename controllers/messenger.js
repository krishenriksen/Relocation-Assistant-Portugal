'use strict';

const GPT3 = require(`./gpt3.js`);
const axios = require('axios');

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

		if (response.object === 'page') {

			let msgObject = self.getMessageObject(response);

			// generate response from GPT-3
			let resMsg = new GPT3().response(msgObject.message);

			console.log(resMsg);

			// Define the message data to Facebook
			const messageData = {
				messaging_type: "RESPONSE", // or "MESSAGE_TAG" if applicable
				recipient: {
					id: msgObject.id // The ID of the user you want to send the message to
				},
				message: {
					text: resMsg // The message content
				}
			};

			const res = axios.post('https://graph.facebook.com/v8.0/me/messages', messageData, {
				params: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN }
    		});

			console.log('Message sent successfully to facebook:', res.data);
		}

		// 200 OK
		return res.status(200).json({
			message: 'OK'
		});

		// 418 I'm a teapot
		return res.status(418).json({
			message: 'The server refuses the attempt to brew coffee with a teapot..'
		});
	}

	getMessageObject = function(json) {

        const message = json.entry[0].messaging[0].message.text
        const id = json.entry[0].messaging[0].sender.id
        return {message, id};
	}
}

module.exports = MessengerController;