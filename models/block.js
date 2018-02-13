/**
*@class Block
*@classdesc This class represents a block in the blockchain.
*/
module.exports = class Block {

	/**
	*Constructor for Block class
	*@constructs
	*@param {number} index - The index of this Block
	*@param {Array} transactions - An Array of transactions
	*@param {number} proof - Proof of work
	*@param {string} previousHash - Hash of previous Block
	*/
	constructor(index, transactions, proof, previousHash) {
		this.index = index;
		this.timestamp = Date.now();
		this.transactions = transactions;
		this.proof = proof;
		this.previousHash = previousHash;
	}
}
