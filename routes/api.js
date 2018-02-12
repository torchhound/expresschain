const express = require('express');
const uuidv4 = require('uuid/v4');

const Blockchain = require('../models/blockchain');

var router = express.Router();
var blockchain = new Blockchain();
const nodeIdentifier = uuidv4().toString();

router.get('/mine', function(req, res, next) {
	let lastBlock = blockchain.lastBlock();
	let lastProof = lastBlock.proof;
	let proof = blockchain.proofOfWork(lastProof);

	blockchain.newTransaction(0, nodeIdentifier, 1);

	let previousHash = blockchain.hash(lastBlock);
	let block = blockchain.newBlock(proof, previousHash);

	let response = {
		'message': 'New Block Mined',
		'index': block.index,
		'transactions': block.transactions,
		'proof': block.proof,
		'previousHash': block.previousHash
	};

	res.status(200).json(JSON.stringify(response));
});

router.post('/transactions/new', function(req, res, next) {
	if (req.body.sender === "" || req.body.recipient === "" || req.body.amount === "") {
		res.status(400).send("Missing Values in JSON Request");	
	} else {
		index = blockchain.newTransaction(req.body.sender, req.body.recipient, req.body.amount)
		res.status(201).json(JSON.stringify({'message': 'Transaction will be added to Block ' + index}));
	}
});

router.get('/chain', function(req, res, next) {
	res.status(200).json(JSON.stringify({'chain': blockchain.chain, 'length': blockchain.chain.length}));
});

module.exports = router;
