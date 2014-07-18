var mongoose = require('mongoose'),
    SharedPayment = ('./sharedPayment');

module.exports = mongoose.model('Payment', {
    description: String,
    place: String,
    issuedBy: String,
    paymentType: String,
    amount: Number,
    sharedPayments: [SharedPayment]
});