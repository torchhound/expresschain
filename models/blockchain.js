const crypto = require('crypto');

const Transaction = require('./transaction');
const Block = require('./block');

module.exports = class Blockchain {
	constructor() {
		this.chain = [];
		this.currentTransactions = [];
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
		return this.lastBlock() + 1;
	}

	hash(block){
		return crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex');
	}

	lastBlock(){
		return this.chain[-1];
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
}
