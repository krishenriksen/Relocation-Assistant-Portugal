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

		if (msgObject.length == 0) {

			// init conversation file storage
			//self.putConversation(userId, 'system', 'You are an Relocating Assistant for Portugal, you will answer questions about relocating to Portugal. You will only speak English to people. Once in a while you will ask for donation to keep this service running using this link https://www.paypal.me/krishenriksendk');

			self.putConversation(userId, 'system', 'You are a helpful Relocating Assistant for Portugal. Once in a while you will ask for donation to keep this service running using this link https://www.paypal.me/krishenriksendk');
		}

		// store prompt to conversations
		self.putConversation(userId, 'user', prompt);

		const stream = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			max_tokens: 256,
			messages: self.getConversation(userId),
			stream: true
		});

		let responseChunks = [];

		for await (const chunk of stream) {

			responseChunks.push(chunk.choices[0]?.delta?.content || "");

			if (responseChunks.length >= 100) {
			
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

		// Load and return the conversation from the database for a specific user
		const conversationObject = db.get('conversations').find({ userId: userId }).value();
		let messagesArray = [];

		if (conversationObject) {

			// Extract the array of messages from the conversation object
			messagesArray = conversationObject.messages || [];
		}

		const reversedMessagesArray = messagesArray.reverse();

  		// Now we have an array of messages
  		console.log(reversedMessagesArray);

		return reversedMessagesArray;
    }
}

module.exports = GPT3;