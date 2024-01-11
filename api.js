'use strict';

require('dotenv').config();

// made sure node do not quit
process.on('uncaughtException', function (err) {
	console.error(err);
	console.log('Node NOT Exiting..');
});

const express = require('express');
const https = require('node:https');
const fs = require('node:fs');
const app = express();
const bodyParser = require('body-parser');

app.disable('x-powered-by');

/*-------------------------------------
	allow `Access-Control-Allow-Origin`
---------------------------------------*/

const cors = require('cors');
app.use(cors());

/*-------------------------------------
	easy http post receive
---------------------------------------*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*-------------------------------------
	define routes
---------------------------------------*/

var routes = require('./routes/route.js');
routes(app);

/*-------------------------------------
	The rest
---------------------------------------*/

app.use(function(req, res) {

	res.status(404).send({ url: req.originalUrl + ' not found' })
});

// Create an HTTPS service identical to the HTTP service.
https.createServer({
	key: fs.readFileSync('/etc/letsencrypt/live/api.aigo.dev/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/api.aigo.dev/fullchain.pem')
}, app).listen(process.env.PORT);