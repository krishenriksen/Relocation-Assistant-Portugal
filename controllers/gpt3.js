'use strict';

const { OpenAI } = require('openai');
const Facebook = require(`./facebook.js`);

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

		const stream = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			max_tokens: 1000,
			messages: [{ role: "user", content: prompt }],
			stream: true
		});

		let responseChunks = [];

		for await (const chunk of stream) {

			responseChunks.push(chunk.choices[0]?.delta?.content || "");

			if (responseChunks.length >= 50) {
			
				// send response to Facebook user
				new Facebook().send(userId, responseChunks.join(''));

				// empty responseChunks
				responseChunks = [];
			}
		}

		// send response to Facebook user
		new Facebook().send(userId, responseChunks.join(''));
	}
}

module.exports = GPT3;