var mongoose = require('mongoose'),
    UidController = require('./controllers/uidController'),
    AuthController = require('./controllers/authController'),
    db = require('../config/database'),
    auth = require('./logic/authentication'),
    uidController = new UidController(),
    authController = new AuthController();

mongoose.connect(db.url);

module.exports = function (app) {


    // Authentication
    app.post('/v1/api/auth', authController.doAuth);

    // Calculation
    app.get('/v1/api/calculate', uidController.calculate);

    // Uids
    app.get('/v1/api/uids', auth.isAuthenticated, uidController.all);
    app.get('/v1/api/uids/:name',  uidController.getByName);
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