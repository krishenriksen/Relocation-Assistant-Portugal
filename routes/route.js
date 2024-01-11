'use strict';

// winston logs
const logger = require('../middleware/logger.js');
const sanitize = require('../middleware/sanitize.js');

const MessengerController = require('../controllers/messenger.js');

module.exports = function(app) {

	const messenger = new MessengerController(logger);

	/*-------------------------------------
		Facebook messenger endpoints
	---------------------------------------*/

	app.get('/v0', sanitize, messenger.subscribe);
	app.post('/v0', sanitize, messenger.process);

	/*-------------------------------------
		health check
	---------------------------------------*/

	app.get('/health', (req, res) => {

		const os = require('os');
	
		const avg_load = os.loadavg();
	
		/*
		console.log("Load average (1 minute):"
					+ String(avg_load[0]));
		
		console.log("Load average (5 minute):"
					+ String(avg_load[1]));
		
		console.log("Load average (15 minute):"
					+ String(avg_load[2]));
		*/	
	
		// server has capacity
		if (avg_load[1] < 30) {
	
			return res.status(200).send('ok');
		}
	
		return res.status(400).send('server is overloaded');
	});
};