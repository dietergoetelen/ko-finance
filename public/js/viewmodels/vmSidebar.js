var Uid = function() {
    this.qualifier = ko.observable();
    this.name = ko.observable();
};


app.vmSidebar = (function () {

    var
        newUid = ko.observable(),
        uids = ko.observableArray(),
        sharedPaymentsVisible = ko.observable(false),
        selectedUid,
        showLogin = ko.observable(false),

        navigateUid = function () {
            app.pubSub.notifySubscribers(this.name(), app.utils.subscriberType.uid);
        },

        orderedUids = ko.computed(function () {
            return _.sortBy(uids(), function (uid) {
                return uid.qualifier() * -1;
            });
        }),

        addNewUid = function () {
            var foundUid = _.first(orderedUids());
            var qualifier = -1;

            if (foundUid) {
                qualifier = foundUid.qualifier();
            }
            
            var uid = new Uid();
            uid.qualifier(++qualifier);
            uid.name(newUid());

            // Save to db
            app.dataContext.addUid(uid);

            // Insert at first position
            uids.push(uid);

            // Select this UID  
            app.pubSub.notifySubscribers(newUid(), app.utils.subscriberType.uid);
            newUid('');
        };


    app.pubSub.subscribe(function(data) {
        _.each(data, function (u) {
            var uid = new Uid();
            uid.qualifier(u.qualifier);
            uid.name(u.name);
            uids.push(uid);
        });

        if (!selectedUid) {
            if (data.length > 0) {
                selectedUid = data[0].name;
                app.pubSub.notifySubscribers(data[0].name, app.utils.subscriberType.uid);
            }
        }

    }, null, app.utils.subscriberType.uids);

    app.pubSub.subscribe(function(data) {

        sharedPaymentsVisible(data[0]);

    }, null, app.utils.subscriberType.showSharedPayments);

    app.pubSub.subscribe(function (value) {
        showLogin(value);
    }, null, app.utils.subscriberType.showLogin);

    return {
        newUid: newUid,
        uids: uids,
        navigateUid: navigateUid,
        sharedPaymentsVisible: sharedPaymentsVisible,
        addNewUid: addNewUid,
        orderedUids: orderedUids,
        showLogin: showLogin
    };

})();

ko.applyBindings(app.vmSidebar, document.getElementById("sidebar"));