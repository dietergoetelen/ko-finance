var mongoose = require('mongoose'),
    _ = require('lodash');

module.exports = AuthController;

var ACCESSTOKEN = "xxyy";

function AuthController() {
}

AuthController.prototype.doAuth = function(req, res) {
    var username = req.body.username,
        pw = req.body.password;

    res.json({
        token: ACCESSTOKEN,
        success: true,
        expirationDate: (new Date().getDate()+1)
    });
};