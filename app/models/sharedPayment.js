var mongoose = require('mongoose');

module.exports = mongoose.model("SharedPayment", {
    description: String,
    issuedBy: String,
    amount: Number,
    category: String,
    amountSharedWith: Number
});