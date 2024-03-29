'use strict';

const { OpenAI } = require('openai');
const Facebook = require(`./facebook.js`);

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ conversations: [] }).write();

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

		const msgObject = self.getConversation(userId);

		if (msgObject.length === 0) {

			// init conversation file storage
			self.putConversation(userId, 'system', 'You are an Relocating Assistant for Portugal, you will only answer questions about relocating to Portugal. You will only speak English to people. At the end of your answer, you will ask for donation to keep this service running using this link www.paypal.me/krishenriksendk but keep it very short.');
		}

		// store prompt to conversations
		self.putConversation(userId, 'user', prompt);

		const stream = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			max_tokens: 1000,
			messages: self.getConversation(userId),
			stream: true
		});

		let responseChunks = [];

		for await (const chunk of stream) {

			responseChunks.push(chunk.choices[0]?.delta?.content || "");

			if (responseChunks.length >= 256) {
			
				// send response to Facebook user
				new Facebook().send(userId, responseChunks.join(''));

				// store conversation
				self.putConversation(userId, 'assistant', responseChunks.join(''));

				// empty responseChunks
				responseChunks = [];
			}
		}

		if (responseChunks.length > 0) {

			// send response to Facebook user
			new Facebook().send(userId, responseChunks.join(''));

			// store conversation
			self.putConversation(userId, 'assistant', responseChunks.join(''));
		}
	}

	/**
	* store new prompt from user
	* @author   Kris Henriksen
	* @param    {Int} userId    user id from facebook messenger
	* @param    {Int} role   	system, user, assistant
	* @param    {Int} content   prompt for gpt
	*/
	putConversation = (userId, role, content) => {

		const messages = [
			{ role: role, content: content },
		];

		// Save the conversation to the database
        db.get('conversations').push({ userId, messages }).write();
	}

	/**
	* get all prompts from userid
	* @author   Kris Henriksen
	* @param    {Int} userId    user id from facebook messenger
	*/	
	getConversation = (userId) => {

		// use flatMap to flatten the messages from all conversations for the specified userId
		const messagesArray = db
		.get('conversations')
		.filter({ userId: userId })
		.flatMap('messages')
		.value();

		// Now, 'messagesArray' is an array of all message objects for the specified userId
		console.log(messagesArray);

		return messagesArray;
    }
}

module.exports = GPT3;