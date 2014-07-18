/// <reference path="../models/sharedPayment.js" />
var mongoose = require('mongoose'),
    Uid = require('../models/uid'),
    _ = require('lodash');

module.exports = UidController;

function UidController() {
}

// Calculation ========================================================================================
UidController.prototype.calculate = function (req, res) {
    if (req.query.qualifier) {
        Uid.find()
            .where('qualifier').lt(req.query.qualifier).gt(0)
            .select('payments qualifier')
            .exec(function (err, items) {
                var total = 0;

                items.forEach(function(item) {
                    item.payments.forEach(function (payment) {
                        total += payment.amount || 0;

                        payment.sharedPayments.forEach(function(sharedPayment) {
                            total += sharedPayment.amount / sharedPayment.amountSharedWith;
                        });
                    });

                });

                res.json({ amount: total });
        });
    } else {
        res.send(404);
    }
};

// UID ================================================================================================
UidController.prototype.all = function (req, res) {
    Uid.find().sort('-qualifier').select('name qualifier amount').exec(function(err, items) {
        res.json(items);
    });
};

UidController.prototype.add = function (req, res) {
    var uid = new Uid({
        qualifier: req.body.qualifier,
        name: req.body.name
    });

    uid.save(function () {
        // Check if there are defaults
        Uid.findOne({ 'qualifier': 0 }, function (error, item) {

            if (!error) {
                var payments = item.payments || [],
                    total = payments.length;

                function saveAll() {
                    var payment = payments.pop().toObject();

                    payment.uid = req.body.name;
                    delete payment._id;
                    delete payment.__v;

                    uid.payments.push(payment);

                    uid.save(function (err) {
                        if (err) {
                            res.send(500);
                        } else {

                            if (--total) {
                                saveAll();
                            } else {
                                res.json({ payments: uid.payments });
                            }
                        }
                    });
                }

                if (payments.length > 0) {
                    saveAll();
                } else {
                    res.json([]);
                }
            } else {
                res.send(500);
            }
        });
    });
};

UidController.prototype.getByName = function (req, res) {
    Uid.findOne({ "name": req.params.name }).select('name qualifier amount').exec(function (err, item) {
        if (err) {
            res.send(500);
        } else {
            if (item) {
                var retVal = item.toObject();
                retVal.isPrevious = req.query.previous ? true : false;

                res.json(retVal);
            } else {
                res.json(item);
            }
        }
    });
};

// Payments ===========================================================================================
UidController.prototype.allPaymentsByName = function(req, res) {
    Uid.findOne({ 'name': req.params.name }).populate('payments').populate('payments.sharedPayments').select('payments').exec(function (err, result) {
        if (!result) {
            res.json([]);
        } else {
            res.json(result);
        }
    });
};

UidController.prototype.addPayment = function (req, res) {
    var name = req.params.name;
    var payment = req.body;

    delete payment._id;

    Uid.findOne({ 'name': name }, function (err, doc) {
        if (err) {
            res.send(500, { error: err });
        } else {
            if (!doc || !doc.payments) {
                res.send(404, { error: "document not found" });
            } else {
                doc.payments.push(payment);
                doc.save(function (error) {
                    if (error) {
                        throw err;
                    }
                    res.json({ "doc": "saved" });
                });
            }
        }
    });
};

UidController.prototype.updatePayment = function (req, res) {
    var id = req.body._id;

    Uid.findOne().where('payments._id').in([id]).exec(function (error, uid) {
        var payment = uid.payments.id(id);

        payment.description = req.body.description;
        payment.place = req.body.place;
        payment.issuedBy = req.body.issuedBy;
        payment.amount = req.body.amount;

        uid.save(function (err, item) {
            if (err) {
                res.send(500);
            } else {
                res.send(200);
            }
        });
    });
};

UidController.prototype.deletePayment = function (req, res) {
    var id = req.body._id;

    Uid.findOne().where('payments._id').in([id]).exec(function (error, uid) {

        var indexToRemove = _.indexOf(uid.payments, function (payment) {
            return payment._id === id;
        });

        uid.payments.splice(indexToRemove, 1);

        uid.save(function (err) {
            if (err) {
                res.send(500);
            } else {
                res.send(uid.payments);
            }
        });
    });
};


// Shared Payments ====================================================================================
UidController.prototype.allSharedPayments = function (req, res) {
    Uid.findOne().where('payments._id').in([req.params.id]).exec(function(err, result) {
        if (result && result.payments) {
            var payments = result.payments;
            var retVal = _.find(payments, function(p) {
                return p._id == req.params.id;
            });

            res.json(retVal.sharedPayments);
        } else {
            res.json({
                err: err,
                res: result,
                id: req.params.id
            });
        }
    });
};

UidController.prototype.addSharedPayment = function(req, res) {
    Uid.findOne().where('payments._id').in([req.params.id]).exec(function (err, result) {
        if (result && result.payments) {
            var payment = _.find(result.payments, function (p) {
                return p._id == req.params.id;
            });

            payment.sharedPayments.push(req.body);

            result.save(function (error) {
                if (error) {
                    res.send(500);
                } else {
                    res.json(200);
                }
            });
        }
    });
};

UidController.prototype.updateSharedPayment = function(req, res) {
    var paymentId = req.params.id;
    var sharedPaymentId = req.body._id;

    Uid.findOne().where('payments._id').in([paymentId]).exec(function (error, uid) {
        var payment = uid.payments.id(paymentId);

        var sharedPayment = _.find(payment.sharedPayments, function (sp) {
            console.log(sp._id, sharedPaymentId);
            return sp._id == sharedPaymentId;
        });

        if (sharedPayment) {
            sharedPayment.description = req.body.description;
            sharedPayment.amount = req.body.amount;
            sharedPayment.issuedBy = req.body.issuedBy;

            uid.save(function(err, item) {
                if (err) {
                    res.send(500);
                } else {
                    res.send(200);
                }
            });
        } else {
            res.send(404);
        }

    });
};