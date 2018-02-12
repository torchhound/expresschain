module.exports = class Block {
	constructor(index, transactions, proof, previousHash) {
		this.index = index;
		this.timestamp = Date.now();
		this.transactions = transactions;
		this.proof = proof;
		this.previousHash = previousHash;
	}
}
