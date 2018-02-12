const express = require('express');
const bodyParser = require('body-parser');

const api = require('./routes/api');

var config = require('./config');
const port = config.port;
const app = express();
const http = require('http').Server(app);

app.use(bodyParser.json());
app.use('/', api);

http.listen(port, function() {
	console.log("Listening on port" + port);
}

module.exports = app;
