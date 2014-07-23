var Payment = function () {
    var self = this;
    self.description = ko.observable();
    self.place = ko.observable();
    self.issuedBy = ko.observable();
    self.paymentType = ko.observable();
    self.amount = ko.observable();
    self.sharedPayments = ko.observableArray();
    self.editMode = ko.observable(false);
    self._id = null;
    self.uid = null;
};

app.vmContent = (function () {

    var
        selectedUid = ko.observable(),
        uids = ko.observableArray(),
        payments = ko.observableArray(),
        showLogin = ko.observable(false),
        dataLoading = ko.observable(true),
        sharedPaymentsVisible = ko.observable(false),
        valuePreviousMonth = ko.observable(0),
        newBalance = ko.computed(function() {
            return valuePreviousMonth() + app.utils.calcTotal(payments());
        }),

        newPaymentModel = {
            amount: ko.observable(0),
            description: ko.observable(),
            place: ko.observable(),
            issuedBy: ko.observable(),
            paymentType: ko.observable(app.utils.paymentType.credit),
        },

        _resetNewPaymentModel = function() {
            newPaymentModel.amount(0);
            newPaymentModel.description("");
            newPaymentModel.place("");
            newPaymentModel.issuedBy("");
            newPaymentModel.paymentType(app.utils.paymentType.credit);
        },

        _calcTotal = function(pymnts) {
            return '€ ' + app.utils.calcTotal(pymnts());
        },

        /**
         * Type: function
         * Description: removes a payment out of the payments array
         */
        removePayment = function(payment) {
            payments.remove(payment);

            app.dataContext.removePayment(payment);
        },

        calculatedAmount = function(context) {
            var total = 0;

            _.each(context.sharedPayments(), function (sp) {
                total += +sp.amount() / +sp.amountSharedWith();
            });

            return Math.round(total * 100) / 100;
        },

        /**
         * Type: bool
         * Description: flag used to show new payment form
         */
        addingPayment = ko.observable(false),

        /**
         * Type: function
         * Description: adds a new payment into the system
         */
        addPayment = function(model) {
            var payment = new Payment();

            payment.amount(model.amount());
            payment.description(model.description());
            payment.issuedBy(model.issuedBy());
            payment.place(model.place());
            payment.paymentType(model.paymentType());
            payment.uid = selectedUid();

            payments.push(payment);

            // Send to datacontext
            app.dataContext.addPayment(payment);

            // Reset values
            addingPayment(false);
            _resetNewPaymentModel();
        },

        swapEditMode = function () {
            if (this.editMode() === true) {
                // Save to database
                app.dataContext.updatePayment(this);
            }

            this.editMode(!this.editMode());
        },

        /*
         * Type: function
         * Description: Checks whether the newpaymentmodel is valid yes/no
         */
        newPaymentValid = ko.computed(function() {
            if (newPaymentModel.description() === undefined || newPaymentModel.description().length <= 0) {
                return false;
            }

            if (newPaymentModel.place() === undefined || newPaymentModel.place().length <= 0) {
                return false;
            }

            if (newPaymentModel.issuedBy() === undefined || newPaymentModel.issuedBy().length <= 0) {
                return false;
            }

            if (newPaymentModel.amount() === undefined || !app.utils.isNumeric(newPaymentModel.amount())) {
                return false;
            }

            // If type is credit amount can't be lower than zero
            if (newPaymentModel.paymentType() === undefined || (newPaymentModel.paymentType() === app.utils.paymentType.credit && newPaymentModel.amount() < 0)) {
                return false;
            }

            // If type is debet amount can't be higher than zero
            if (newPaymentModel.paymentType() === undefined || (newPaymentModel.paymentType() === app.utils.paymentType.debet && newPaymentModel.amount() > 0)) {
                return false;
            }

            return true;
        }),

        /**
         * Type: function
         * Description: set's addingpayment to false
         */
        cancelPayment = function() {
            addingPayment(false);
            _resetNewPaymentModel();
        },

        /**
         * Type: function
         * Description: set's addingpayment to true
         */
        newPayment = function() {
            addingPayment(true);
        },

        paymentsByType = function(type) {
            return ko.dependentObservable(function() {
                return _.filter(payments(), function(p) {
                    return p.paymentType() === app.utils.paymentType[type];
                });
            });
        },

        totalPaymentsByType = function(type) {
            return ko.dependentObservable(function () {
                if (type === 'all') {
                    return _calcTotal(payments);
                } else {
                    return _calcTotal(paymentsByType(type));
                }
            });
        },

        /**
         * Type: function
         * Description: set's flag sharedCosts to true
         */
        triggerSharedCosts = function () {
            app.pubSub.notifySubscribers([true, this], app.utils.subscriberType.showSharedPayments);
        };

    app.pubSub.subscribe(function(isLoading) {
        if (isLoading === true) {
            dataLoading(true);
        } else {
            dataLoading(false);
        }
    }, null, app.utils.subscriberType.loading);

    app.pubSub.subscribe(function (value) {
        // Get new payments based on new UID
        app.dataContext.getPayments(value);

        // Set new selected UID
        selectedUid(value);
    }, null, app.utils.subscriberType.uid);

    app.pubSub.subscribe(function(value) {

        valuePreviousMonth(value);

    }, null, app.utils.subscriberType.calculatePrevious);

    app.pubSub.subscribe(function (value) {
        // Reset payments array
        payments([]);

        // Add new values to payments array
        _.each(value.payments, function (p) {
            var payment = new Payment();

            payment.amount(p.amount);
            payment.issuedBy(p.issuedBy);
            payment.description(p.description);
            payment.place(p.place);
            payment.paymentType(p.paymentType);
            payment._id = p._id;
            payment.uid = selectedUid();

            _.each(p.sharedPayments, function (sp) {
                var sharedPayment = new SharedPayment();
                sharedPayment.amount(sp.amount);
                sharedPayment.amountSharedWith(sp.amountSharedWith);
                sharedPayment.category(sp.category);
                sharedPayment.issuedBy(sp.issuedBy);
                sharedPayment.description(sp.description);
                sharedPayment._id = sp._id;

                payment.sharedPayments.push(sharedPayment);
            });

            payments.push(payment);
        });

        app.pubSub.notifySubscribers(false, app.utils.subscriberType.loading);
    }, null, app.utils.subscriberType.payments);

    app.pubSub.subscribe(function (data) {
        sharedPaymentsVisible(data[0]);
    }, null, app.utils.subscriberType.showSharedPayments);

    app.pubSub.subscribe(function (value) {
        console.log(value);
        showLogin(value);
    }, null, app.utils.subscriberType.showLogin);

    return {
        uids: uids,
        uid: selectedUid,
        payments: payments,
        addPayment: addPayment,
        newPayment: newPayment,
        paymentModel: newPaymentModel,
        addingPayment: addingPayment,
        newPaymentValid: newPaymentValid,
        removePayment: removePayment,
        cancelPayment: cancelPayment,
        paymentsByType: paymentsByType,
        totalPaymentsByType: totalPaymentsByType,
        triggerSharedCosts: triggerSharedCosts,
        sharedPaymentsVisible: sharedPaymentsVisible,
        calculatedAmount: calculatedAmount,
        swapEditMode: swapEditMode,
        dataLoading: dataLoading,
        valuePreviousMonth: valuePreviousMonth,
        newBalance: newBalance,
        showLogin:showLogin
    };
})();

ko.applyBindings(app.vmContent, document.getElementById("content"));