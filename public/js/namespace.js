var app = {};

app.pubSub = new ko.subscribable();

app.utils = {};

app.utils.paymentType = {
    credit: "credit",
    debet: "debet",
    casual: "casual",
    shared: "shared"
};

app.utils.sharedPaymentCategory = {
    other: "Other",
    food: "Food",
    fixed: "Fixed"
};

app.utils.subscriberType = {
    uids: "data.uids",
    uid: "data.uid",
    payments: "data.payments",
    showSharedPayments: "show.sharedPayments",
    loading: "data.loading",
    calculatePrevious: "data.calculatePrevious",
    updateMonthSalary: "data.updateMonthSalary"
};

app.utils.calculateShared = function(sharedPayments) {
    var total = 0;

    _.each(sharedPayments, function (sp) {
        total += +sp.amount() / +sp.amountSharedWith();
    });

    return Math.round(total * 100) / 100;
};

app.utils.calcTotal = function(payments) {
    var total = 0;

    _.each(payments, function (p) {
        total += app.utils.calculateShared(p.sharedPayments());
        total += +p.amount(); // Convert p.amount to int
    });

    return Math.round(total * 100) / 100;
};

app.utils.isNumeric = function(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
};