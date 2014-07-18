var mongoose = require('mongoose'),
    Payment = require('../models/payment'),
    SharedPayment = require('../models/sharedPayment'),
    _ = require('lodash');

module.exports = PaymentController;

var _mapObject = function (body) {
    var mapped = {
        description: body.description,
        place: body.place,
        issuedBy: body.issuedBy,
        paymentType: body.paymentType,
        amount: body.amount,
        uid: body.uid
    };

    return _addSharedPayments(mapped, body.sharedPayments);
};

var _addSharedPayments = function(obj, sharedPayments) {
    _.each(sharedPayments, function(sp) {
        var sharedPayment = new SharedPayment(sp);
        obj.sharedPayments.push(sharedPayment);
    });

    return obj;
};

function PaymentController() {
}

/**
 * Returns a list of all payments
 */
PaymentController.prototype.all = function(req, res) {
    Payment.find(function(err, items) {
        res.json(items);
    });
};

/**
 * Update a payment
 */
PaymentController.prototype.update = function (req, res) {
    var mappedObj = _mapObject(req.body);
    var id = req.body._id;

    Payment.update({_id: id}, mappedObj, {upsert: true}, function(err) {
        if (err) {
            res.send("Couldn't update payment with id: " + id, 500);
        } else {
            res.send(200);
        }

    });
};

/**
 * Delete a payment
 */
PaymentController.prototype.delete = function(req, res) {
    var id = req.body._id;

    Payment.remove({ "_id": id }, function(err) {
        if (err) {
            res.send("Couldn't delete payment with id: " + id, 500);
        } else {
            res.send(200);
        }
    });
};

/**
 * Find by UID
 */
PaymentController.prototype.findByUid = function (req, res) {
    var uid = req.params.uid,
        prevUid = req.query.include;

    Payment.find({$or: [{ 'uid': uid }, {'uid':prevUid}]}, function(err, items) {
        var retVal = {
            current: _.filter(items, function (item) { return item.uid === uid; })
        };

        res.json(retVal);
    });
};

/** 
 * Saves a new payment in the database
 */
PaymentController.prototype.add = function (req, res) {
    var pmnt = new Payment(_mapObject(req.body));

    pmnt.save(function(err, payment) {
        res.json(payment);
    });
};