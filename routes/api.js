const express = require('express');
const uuidv4 = require('uuid/v4');

const Blockchain = require('../models/blockchain');

var router = express.Router();
var blockchain = new Blockchain();
const nodeIdentifier = uuidv4().toString().replace('-', '');

router.get('/mine', function(req, res, next) {

}

router.post('/transactions/new', function(req, res, next) {

}

router.get('/chain', function(req, res, next) {
	res.json(JSON.stringify({'chain': blockchain.chain, 'length': blockchain.chain.length}));
}

module.exports = router;
