'use strict';

const { OpenAI } = require('openai');
const Facebook = require(`./facebook.js`);
const jsonfile = require('jsonfile');

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

		// instruct ChatGPT to only answer question about relocating to Portugal
		await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: 'You are an Relocating Assistant for Portugal, you will only answer questions about Portugal. If people ask question about things not related to Portugal you will answer that you are not trained for this.' }],
			max_tokens: 1,
		});

		const stream = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			max_tokens: 256,
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