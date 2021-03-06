const crypto = require('crypto');
const url = require('url');
const got = require('got');
const express = require('express');

const Transaction = require('./transaction');
const Block = require('./block');

/**
*@class Blockchain
*@classdesc This class contains the blockchain and associated methods.
*/
module.exports = class Blockchain {

	/**
	*Constructor for Blockchain class
	*@constructs
	*/
	constructor() {
		this.chain = [];
		this.currentTransactions = [];
		this.nodes = new Set();
		this.newBlock(1, 100);
	}

	/**
	*Creates a new Block and pushes it to the chain
	*@param {number} proof - Proof of work
	*@param {string} [previousHash=Object] - Hash of previous Block
	*@return {Object} block - A new Block Object to be added to the chain
	*/
	newBlock(proof, previousHash = this.hash(this.lastBlock())){
		let block = new Block(this.chain.length + 1, this.currentTransactions, proof, previousHash);
		this.currentTransactions = [];
		this.chain.push(block);
		return block;
	}

	/**
	*Pushes a new Transaction to the array of transactions
	*@param {string} sender - The sender's identifier
	*@param {string} recipient - The recipient's identifier
	*@param {string} amount - The amount to be transferred
	*/
	newTransaction(sender, recipient, amount){
		this.currentTransactions.push(new Transaction(sender, recipient, amount));
		return this.lastBlock().index + 1;
	}

	/**
	*Creates a SHA256 hash string for a given Block
	*@param {Object} block - A Block Object
	*@return {string} hash - A SHA256 hash of the Block Object
	*/
	hash(block){
		return crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex');
	}

	/**
	*Returns the last Block on the chain
	*@return {Object} Block - The last block on the chain
	*/
	lastBlock(){
		return this.chain[this.chain.length - 1];
	}

	/**
	*Finds a number such that a hash of the last proof and a new proof contain 4 ending zeroes
	*@param {number} lastProof - The previous proof
	*@return {number} proof - The next proof
	*/
	proofOfWork(lastProof) {
		let proof = 0;
		while (!this.validProof(lastProof, proof)) {
			proof += 1
		}
		return proof;
	}

	/**
	*Hashes the new proof and the previous proof and returns a boolean if the new proof is valid
	*@param {number} lastProof - The previous proof
	*@param {number} proof - The next proof
	*@return {boolean} validity - Whether a proof is valid or not
	*/
	validProof(lastProof, proof) {
		let guess = lastProof.toString() + proof.toString();
		let guessHash = crypto.createHash('sha256').update(guess).digest('hex');
		return guessHash.substr(guessHash.length - 4) == '0000';
	}

	/**
	*Adds a node's address to the Set of addresses known to the current node
	*@param {string} address - The url of a node to be added
	*/
	registerNode(address) {
		let parsedAddress = url.parse(address);
		this.nodes.add(parsedAddress.host);
	}

	/**
	*Checks a blockchain for valid block hashes and valid proofs
	*@param {Array} chain - An Array of Block Objects
	@return {boolean} validity - Whether a blockchain is valid or not
	*/
	validChain(chain) {
		let lastBlock = chain[0];
		let currentIndex = 1;

		while (currentIndex < chain.length) {
			let block = chain[currentIndex];
			if(block.previousHash != this.hash(lastBlock)) {
				return false;
			}

			if (!this.validProof(lastBlock.proof, block.proof)) {
				return false;
			}

			lastBlock = block;
			currentIndex += 1;
		}

		return true;
	}

	/**
	*Emits an Express response based on the length and validity of a chain. If a chain is valid and longer and the current chain it supplants it.
	*@param {Object} res - An Express response object
	*@async
	*/
	async resolveConflicts(res) {
		let neighbors = [];
		this.nodes.forEach(function(value) {
			neighbors.push(value);
		});
		var newChain = null;
		var maxLength = this.chain.length;
		(async () => {
			for (var x = 0; x < neighbors.length; x++) {
				try {
					const response = await got('http://' + neighbors[x] + '/chain', {json: true});
					let responseOut = JSON.parse(response.body);
					let length = responseOut.length;
					let chain = responseOut.chain;
					console.log("length: " + length + " potentialChain: " + chain);
					console.log("maxLength: " + maxLength + " currentChain: " + this.chain);

					if (length > maxLength && this.validChain(chain)) {
						console.log("new chain!");
						maxLength = length;
						newChain = chain;
					}

				} catch(error) {
					console.log(error);
				}
			}
		})().then(_ => {
			if (newChain) {
				console.log("return true");
				this.chain = newChain;
				res.status(200).json(JSON.stringify({'message': 'Our chain was superseded', 'newChain': this.chain}));
			}
			console.log("return false");
			res.status(200).json(JSON.stringify({'message': 'Our chain is authoritative', 'chain': this.chain}));
		});
	}
}
