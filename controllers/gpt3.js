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

		// Get the conversation from the file
		const filePath = userId + '.txt';

		let data;

		try {

			data = jsonfile.readFileSync(filePath);
			console.log('Data read from JSON file:', data);
		}
		catch {

			// make user conversation file

		}

		// Check if the conversation has messages
		if (data.length == 0) {

			const initPrompt = 'You are an Relocating Assistant for Portugal, you will only answer questions about Portugal. If people ask question about things not related to Portugal you will answer that you are not trained for this.';

			// instruct ChatGPT to only answer question about relocating to Portugal
			await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [{ role: "user", content: initPrompt }],
				max_tokens: 1,
			});

			//jsonfile.writeFileSync(filePath, initPrompt, { spaces: 2 });
		}

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