var Login = function() {
    var self = this;
    self.username = ko.observable();
    self.password = ko.observable();
    self.token = ko.observable();
};

app.vmLogin = (function() {
    var
        showLogin = ko.observable(false),
        username = ko.observable(),
        password = ko.observable(),

        login = function () {
            if (username() && password() && username().length > 0 && password().length > 0) {
                app.dataContext.login(username(), password());
            }
        };


    app.pubSub.subscribe(function (value) {
        showLogin(value);
    }, null, app.utils.subscriberType.showLogin);

    return {
        showLogin: showLogin,
        login: login,
        username: username,
        password: password
    };

})();

ko.applyBindings(app.vmLogin, document.getElementById("login-ko"));