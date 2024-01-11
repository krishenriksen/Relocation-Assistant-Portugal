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

		// Make the API call
		openai.Completion.create({
			engine: "gpt-3.5-turbo",
			prompt: prompt,
			max_tokens: 1000,
			n: 1, // Specify the number of completions you want (in this case, 1)
		})
		.then(response => {

			// Define the message data to Facebook
			const messageData = {
				messaging_type: "RESPONSE", // or "MESSAGE_TAG" if applicable
				recipient: {
					id: userId // The ID of the user you want to send the message to
				},
				message: {
					text: response.choices[0].text.trim() // The message content
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
		})
		.catch(error => {

			console.error('Error making API call:', error.message);
		});
	}
}

module.exports = GPT3;