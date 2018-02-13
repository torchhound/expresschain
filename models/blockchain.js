const crypto = require('crypto');
const url = require('url');
const got = require('got');

const Transaction = require('./transaction');
const Block = require('./block');

module.exports = class Blockchain {
	constructor() {
		this.chain = [];
		this.currentTransactions = [];
		this.nodes = new Set();
		this.newBlock(1, 100);
	}

	newBlock(proof, previousHash = this.hash(this.lastBlock())){
		let block = new Block(this.chain.length + 1, this.currentTransactions, proof, previousHash);
		this.currentTransactions = [];
		this.chain.push(block);
		return block;
	}

	newTransaction(sender, recipient, amount){
		this.currentTransactions.push(new Transaction(sender, recipient, amount));
		return this.lastBlock().index + 1;
	}

	hash(block){
		return crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex');
	}

	lastBlock(){
		return this.chain[this.chain.length - 1];
	}

	proofOfWork(lastProof) {
		let proof = 0;
		while (!this.validProof(lastProof, proof)) {
			proof += 1
		}
		return proof;
	}

	validProof(lastProof, proof) {
		let guess = lastProof.toString() + proof.toString();
		let guessHash = crypto.createHash('sha256').update(guess).digest('hex');
		return guessHash.substr(guessHash.length - 4) == '0000';
	}

	registerNode(address) {
		let parsedAddress = url.parse(address);
		this.nodes.add(parsedAddress.host);
	}

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

	async resolveConflicts() {
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
				return true;
			}
			console.log("return false");
			return false;
		});
	}
}
