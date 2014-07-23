var ACCESSTOKEN = "xxyy",
    auth = {};

auth.isAuthenticated = function (req, res, next) {
    // Todo: decrypt accesstoken to match
    // Decrypted accesstoken looks like user:role:expiration
    console.log(req.headers.accessToken);
    console.log(req.headers);

    if (req.headers.accesstoken === ACCESSTOKEN) {
        next();
    } else {
        res.send(401, "unauthorized");
    }
};

module.exports = auth;