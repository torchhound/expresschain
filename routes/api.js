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
	if (req.body.sender === '' || req.body.recipient === '' || req.body.amount === '') {
		res.status(400).send('Missing Values in JSON Request');	
	} else {
		index = blockchain.newTransaction(req.body.sender, req.body.recipient, req.body.amount)
		res.status(201).json(JSON.stringify({'message': 'Transaction will be added to Block ' + index}));
	}
});

router.get('/chain', function(req, res, next) {
	res.status(200).json(JSON.stringify({'chain': blockchain.chain, 'length': blockchain.chain.length}));
});

router.post('/nodes/register', function(req, res, next) {
	let nodes = req.body.nodes;

	if (!nodes) {
		res.status(400).send('Error: No nodes were supplied');
	} else {
		for (var x = 0; x < nodes.length; x++) {
			blockchain.registerNode(nodes[x]);
		}
		let nodesOut = [];
		blockchain.nodes.forEach(function(value) {
			nodesOut.push(value);
		});
		res.status(201).json(JSON.stringify({'message': 'New nodes have been added', 'totalNodes': nodesOut}));
	}
});

router.get('/nodes/resolve', function(req, res, next) {
	let result = blockchain.resolveConflicts();
	console.log(result);
	if (result === true) {
		res.status(200).json(JSON.stringify({'message': 'Our chain was superseded', 'newChain': blockchain.chain}));
	} else {
		res.status(200).json(JSON.stringify({'message': 'Our chain is authoritative', 'chain': blockchain.chain}));
	}
});

module.exports = router;
