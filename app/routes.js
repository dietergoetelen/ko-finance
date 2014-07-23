var mongoose = require('mongoose'),
    UidController = require('./controllers/uidController'),
    db = require('../config/database'),
    uidController = new UidController(db.url);

mongoose.connect(db.url);

module.exports = function (app) {


    // Payments
    //app.get('/v1/api/payments', paymentController.all);
    //app.get('/v1/api/payments/:uid', paymentController.findByUid);

    //app.put('/v1/api/payments', paymentController.update);

    //app.delete('/v1/api/payments', paymentController.delete);

    //app.post('/v1/api/payments', paymentController.add);

    // Calculation
    app.get('/v1/api/calculate', uidController.calculate);

    // Uids
    app.get('/v1/api/uids', uidController.all);
    app.get('/v1/api/uids/:name', uidController.getByName);
    app.get('/v1/api/uids/:name/payments', uidController.allPaymentsByName);
    app.get('/v1/api/uids/:name/payments/:id', uidController.allSharedPayments);

    app.post('/v1/api/uids', uidController.add);
    app.post('/v1/api/uids/:name/payments', uidController.addPayment);
    app.post('/v1/api/uids/:name/payments/:id', uidController.addSharedPayment);

    app.delete('/v1/api/uids/:name/payments', uidController.deletePayment);

    app.put('/v1/api/uids/:name/payments', uidController.updatePayment);
    app.put('/v1/api/uids/:name/payments/:id', uidController.updateSharedPayment);

    // all other routes send index.html
    app.get('/', function(req, res) {
        res.sendfile('public/index.html');
    });
};