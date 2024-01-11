'use strict';

const { OpenAI } = require('openai');
const axios = require('axios');

const openai = new OpenAI({
	organization: process.env.OPENAI_ORG,
	apiKey: process.env.OPENAI_SECRET_KEY
});

var self;

class GPT3 {

	constructor() {

		self = this;
	}

	response = async (userId, prompt) => {

		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }],
			max_tokens: 1000,
		});

		console.log(completion.choices[0]);

		// Define the message data to Facebook
		const messageData = {
			messaging_type: "RESPONSE", // or "MESSAGE_TAG" if applicable
			recipient: {
				id: userId // The ID of the user you want to send the message to
			},
			message: {
				text: completion.choices[0] // The message content
			}
		};

		// Make the API call to send a message to Facebook
		axios.post('https://graph.facebook.com/v8.0/me/messages', messageData, {
			params: { access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN }
		})
		.then(response => {

			console.log('Message sent successfully:', response.data);
		})
		.catch(error => {

			console.error('Error sending message:', error.message);
		});
	}
}

module.exports = GPT3;