'use strict';

const { OpenAI } = require('openai');

const openai = new OpenAI({
	organization: process.env.OPENAI_ORG,
	apiKey: process.env.OPENAI_SECRET_KEY
});

var self;

class GPT3 {

	constructor() {

		self = this;
	}

	response = async (prompt) => {

		console.log(prompt);

		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [{ role: "user", content: prompt }],
			max_tokens: 1000,
		});

		return completion.choices[0];
	}
}

module.exports = GPT3;