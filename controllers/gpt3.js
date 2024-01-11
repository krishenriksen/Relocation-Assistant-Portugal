'use strict';

const { OpenAI } = require('openai');
const Facebook = require(`./facebook.js`);

import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const openai = new OpenAI({
	organization: process.env.OPENAI_ORG,
	apiKey: process.env.OPENAI_SECRET_KEY
});

const adapter = new FileSync('db.json'); // Specify the JSON file where data will be stored
const db = low(adapter);

// Set up initial structure if the file is empty
db.defaults({ conversations: [] }).write();

var self;

class GPT3 {

	constructor() {

		self = this;
	}

	response = async (userId, prompt) => {

		// Get the conversation from the database
		const conversation = db.get('conversations').find({ id: userId }).value();

		// Check if the conversation has messages
		if (conversation.messages.length == 0) {

			// instruct ChatGPT to only answer question about relocating to Portugal
			await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [{ role: "user", content: 'You are an Relocating Assistant for Portugal, you will only answer questions about Portugal. If people ask question about things not related to Portugal you will answer that you are not trained for this.' }],
				max_tokens: 1,
			});
		}

		conversation.messages.push(prompt);

		const messagesAsString = conversation.messages ? conversation.messages.join('\n') : '';

		console.log(messagesAsString);

		const stream = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			max_tokens: 256,
			messages: [{ role: "user", content: messagesAsString }],
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