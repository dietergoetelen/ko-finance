var SharedPayment = function () {
    var self = this;
    self.description = ko.observable();
    self.issuedBy = ko.observable();
    self.amount = ko.observable(0); // Defaults to 0
    self.category = ko.observable();
    self.amountSharedWith = ko.observable(2); // Defaults to 2 people, calculation depends on this
    self.editMode = ko.observable(false);
    self._id = null;
};

app.vmSharedPayments = (function () {

    var
        showSharedPayments = ko.observable(false),
        showLogin = ko.observable(false),

        newPayment = {
            description: ko.observable(),
            amount: ko.observable(0),
            category: ko.observable(),
            issuedBy: ko.observable()
        },

        _resetNewPayment = function() {
            newPayment.description("");
            newPayment.amount(0);
            newPayment.category("");
            newPayment.issuedBy("");
        },

        categories = ko.observableArray([
            {
                category: app.utils.sharedPaymentCategory.fixed,
                newMode: ko.observable(false),
                payments: ko.observableArray()
            },
            {
                category: app.utils.sharedPaymentCategory.food,
                newMode: ko.observable(false),
                payments: ko.observableArray()
            },
            {
                category: app.utils.sharedPaymentCategory.other,
                newMode: ko.observable(false),
                payments: ko.observableArray()
            }
        ]),

        swapSharedCost = function() {
            var amountShared = this.amountSharedWith();
            
            if (amountShared > 1) {
                this.amountSharedWith(1);
            } else {
                this.amountSharedWith(2);
            }

            // Update shared payment
            app.dataContext.updateSharedPayment(payment().uid, payment()._id, this);

            return true;
        },

        payment = ko.observable(),

        totalCalculatedAmount = ko.computed(function () {
            if (payment() && payment()['sharedPayments']) {
                return app.utils.calculateShared(payment().sharedPayments());
            }

            return 0;
        }),

        swapNewMode = function() {
            var category = this,
                currentMode = category.newMode();

            category.newMode(!currentMode);
            _resetNewPayment();
        },

        swapEditMode = function() {
            if (this.editMode() === true) {
                app.dataContext.updateSharedPayment(payment().uid, payment()._id, this);
            }

            this.editMode(!this.editMode());
        },

        addNewPayment = function () {
            var sharedPayment = new SharedPayment();

            sharedPayment.amount(newPayment.amount());
            sharedPayment.description(newPayment.description());
            sharedPayment.issuedBy(newPayment.issuedBy());
            sharedPayment.category(this.category);

            payment().sharedPayments.push(sharedPayment);

            app.dataContext.addSharedPayment(payment().uid, payment()._id, sharedPayment);

            this.newMode(false);
            _resetNewPayment();
        },

        isShared = function (item) {
            return ko.dependentObservable(function () {
                return item.amountSharedWith() > 1;
            });
        },

        groupedPayments = ko.computed(function() {
            if (payment() && payment()['sharedPayments']) {

                _.each(categories(), function (c) {
                    c.payments([]);
                });

                var result = _.reduce(payment().sharedPayments(), function(prev, current) {

                    var category = _.find(prev, function(p) { return p.category === current.category(); });

                    if (category) {
                        if (!category['payments']) {
                            category['payments'] = ko.observableArray();
                        }

                        category.payments.push(current);
                    }
                    
                    return prev;
                }, categories());

                return result;
            }

            return null;
        }),

        hidePanel = function() {
            app.pubSub.notifySubscribers([false], app.utils.subscriberType.showSharedPayments);
        };

    app.pubSub.subscribe(function (value) {
        if (value[0] === true) {
            $('body').css('overflow', 'hidden');
            $('html, body').animate({ scrollTop: 0 }, 0);
        } else {
            $('body').css('overflow', 'visible');
        }

        showSharedPayments(value[0]);
        payment(value[1]);

    }, null, app.utils.subscriberType.showSharedPayments);

    app.pubSub.subscribe(function (value) {
        showLogin(value);
    }, null, app.utils.subscriberType.showLogin);

    return {
        showSharedPayments: showSharedPayments,
        groupedPayments: groupedPayments,
        hidePanel: hidePanel,
        swapNewMode: swapNewMode,
        newPayment: newPayment,
        addNewPayment: addNewPayment,
        totalCalculatedAmount: totalCalculatedAmount,
        swapEditMode: swapEditMode,
        swapSharedCost: swapSharedCost,
        isShared: isShared,
        showLogin: showLogin
    };

})();

ko.applyBindings(app.vmSharedPayments, document.getElementById("shared-payment-ko"));