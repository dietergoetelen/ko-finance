var mongoose = require('mongoose'),
    SharedPayment = new mongoose.Schema({
        description: String,
        issuedBy: String,
        amount: Number,
        category: String,
        amountSharedWith: Number
    }),
    Payment = new mongoose.Schema({
        description: String,
        place: String,
        issuedBy: String,
        paymentType: String,
        amount: Number,
        sharedPayments: [SharedPayment]
    });

module.exports = mongoose.model('Uid', {
    qualifier: Number,
    name: String,
    amount: Number,
    payments: [Payment]
});