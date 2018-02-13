/**
*This class represents a transaction on the blockchain.
*/
module.exports = class Transaction {

	/**
	*Constructor for Transaction class
	*@param {string} sender - The sender's identifier
	*@param {string} recipient - The recipient's identifier
	*@param {string} amount - The amount to be transferred
	*/
	constructor(sender, recipient, amount) {
		this.sender = sender;
		this.recipient = recipient;
		this.amount = amount;
	}
}
