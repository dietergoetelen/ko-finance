app.dataContext = (function (dataContext) {
    var DEFAULTS_UID_NAME = "Defaults",
        uids = [],
        token = "azer";

    // Ajax setup =====================================================================================
    $.ajaxSetup({
        contentType: 'application/json',
        beforeSend: function(request) {
            request.setRequestHeader("accesstoken", token);
        }
    });

    $(document).ajaxError(function (event, request, settings) {
        if (request.statusText === "Unauthorized") {
            app.pubSub.notifySubscribers(true, app.utils.subscriberType.showLogin);
        }
    });

    // Authentication =================================================================================
    dataContext.login = function(username, password) {
        $.ajax({
            type: 'post',
            url: '/v1/api/auth',
            data: ko.toJSON({ username: username, password: password }),
            success: function(result) {
                if (result.success) {
                    token = result.token;

                    app.pubSub.notifySubscribers(false, app.utils.subscriberType.showLogin);

                    app.dataContext.getUids();
                }
            }
        });

    };

    // Calculation ====================================================================================
    dataContext.calculatePrevious = function (qualifier) {
        $.ajax({
            type: 'get',
            url: '/v1/api/calculate?qualifier=' + qualifier,
            success: function (result) {
                app.pubSub.notifySubscribers(result.amount, app.utils.subscriberType.calculatePrevious);
            }
        });
    };

    // Uids ===========================================================================================
    dataContext.getUids = function () {
        app.pubSub.notifySubscribers(true, app.utils.subscriberType.loading);

        $.ajax({
            type: 'get',
            url: '/v1/api/uids',
            contentType: 'application/json',
            success: function(data) {
                uids = data;

                // Order uids
                var orderedUids = _.sortBy(uids, function (uid) {
                    return uid.qualifier * -1;
                });

                uids = orderedUids;

                app.pubSub.notifySubscribers(orderedUids, app.utils.subscriberType.uids);
            }
        });
    };

    dataContext.addUid = function (uid) {
        $.ajax({
            type: 'post',
            url: '/v1/api/uids',
            contentType: 'application/json',
            data: ko.toJSON(uid),
            success: function (result) {
                app.pubSub.notifySubscribers(result, app.utils.subscriberType.payments);
            }
        });
    };

    // Payments =======================================================================================
    dataContext.getPayments = function (uid) {
        app.pubSub.notifySubscribers(true, app.utils.subscriberType.loading);

        var index = _.indexOf(uids,
            _.find(uids, function (u) {
                return u.name === uid;
            })
        );

        function doPaymentsCall() {
            $.ajax({
                type: 'get',
                url: '/v1/api/uids/' + uid + '/payments',
                contentType: 'application/json',
                success: function (result) {
                    app.pubSub.notifySubscribers(result, app.utils.subscriberType.payments);
                }
            });
        }

        doPaymentsCall();

        // If previous exist, calculate previous amount
        if (index !== -1 && uids[index] && uids[index].name !== DEFAULTS_UID_NAME) {
            dataContext.calculatePrevious(uids[index].qualifier);
        } else {
            app.pubSub.notifySubscribers(0, app.utils.subscriberType.calculatePrevious);
        }
    };

    dataContext.addPayment = function (payment) {
        var uid = payment.uid;

        $.ajax({
            type: 'post',
            url: '/v1/api/uids/' + uid + '/payments',
            contentType: 'application/json',
            data: ko.toJSON(payment),
            success: function () {
                toastr.success("Payment saved into the database");
            }
        });
    };

    dataContext.updatePayment = function (payment) {
        $.ajax({
            type: 'put',
            url: '/v1/api/uids/' + payment.uid + '/payments',
            contentType: 'application/json',
            data: ko.toJSON(payment),
            success: function () {
                toastr.success("Payment updated");
            }
        });
    };

    dataContext.removePayment = function(payment) {
        $.ajax({
            type: 'delete',
            url: '/v1/api/uids/' + payment.uid + '/payments',
            contentType: 'application/json',
            data: ko.toJSON(payment),
            success: function() {
                toastr.success('Payment removed');
            }
        });
    };

    // Shared Payments ================================================================================
    dataContext.addSharedPayment = function (uid, paymentId, sharedPayment) {
        $.ajax({
            type: 'post',
            url: '/v1/api/uids/' + uid + '/payments/' + paymentId,
            contentType: 'application/json',
            data: ko.toJSON(sharedPayment),
            success: function () {
                toastr.success("Payment saved into the database");
            }
        });
    };

    dataContext.updateSharedPayment = function (uid, paymentId, sharedPayment) {
        console.log(uid, paymentId, sharedPayment);

        $.ajax({
            type: 'put',
            url: '/v1/api/uids/' + uid + '/payments/' + paymentId,
            contentType: 'application/json',
            data: ko.toJSON(sharedPayment),
            success: function() {
                toastr.success("Payment updated");
            }
        });
    };

    return dataContext;
})(app.dataContext || (app.dataContext = {}));


