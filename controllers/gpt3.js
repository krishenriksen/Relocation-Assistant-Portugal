'use strict';

const { OpenAI } = require('openai');
const request = require('./requestPromise')

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

		let response;

		for await (const chunk of stream) {

			response += chunk.choices[0]?.delta?.content || "";
		}

		const json = {
            recipient: { userId },
            message: { response }
        }

		const res = await request({
            url: 'https://graph.facebook.com/v8.0/me/messages',
            qs: {
                access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
            },
            json,
            method: 'POST'
        })

        console.log('Facebook says: ', res);
	}
}

module.exports = GPT3;