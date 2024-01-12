'use strict';

const axios = require('axios');

var self;

class Facebook {

	constructor() {

		self = this;
	}

	send = (userId, prompt) => {

		// Define the message data to Facebook
		const messageData = {
			messaging_type: "RESPONSE", // or "MESSAGE_TAG" if applicable
			recipient: {
				id: userId // The ID of the user you want to send the message to
			},
			message: {
				text: prompt // The message content
			}
		};

		axios.post('https://graph.facebook.com/v8.0/me/messages', messageData, {
			params: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN }
		}).then(response => {

			//console.log('Message sent successfully to facebook:', response.data);
		}).catch(error => {

			//console.error('Error sending message to facebook:', error.message);
		});
	}
}

module.exports = Facebook;