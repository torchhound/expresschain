const express = require('express');
const bodyParser = require('body-parser');

const api = require('./routes/api');
var port = process.env.PORT || 5000;
const app = express();
const http = require('http').Server(app);

app.use(bodyParser.json());
app.use('/', api);

http.listen(port, function() {
	console.log("Listening on port " + port);
});

module.exports = app;
