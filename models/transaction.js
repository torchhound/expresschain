module.exports = class Transaction {
	constructor(sender, recipient, amount) {
		this.sender = sender;
		this.recipient = recipient;
		this.amount = amount;
	}
}
