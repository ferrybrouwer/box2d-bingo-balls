/**
 * Payment Request Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 */
(function ($, models, classes) {
    'use strict';

    var user = window.app.model.user || {},
        settings = window.app.model.settings || {};

    /**
     * Payment Request Knockout Model
     * Handle bingopoints to price conversion
     *
     * @constructor
     */
    function KoPaymentRequestModel() {
        var self = this;

        self.maxPoints = ko.observable(_.has(user, 'balance') ? parseInt(user.balance) : 0);
        self.cents_per_point = _.has(settings, 'cents_per_point') ? parseFloat(settings.cents_per_point) : 1;
        self.points = ko.observable(self.maxPoints()).extend({
            numeric: 0,
            maxNumber: self.maxPoints // pass in a observable, because this could change in the future
        });

        /**
         * Computed observable paymentAmount
         * Convert bingopoints into payment amount
         *
         * @param {function}
         * @return {observable}
         */
        self.paymentAmount = ko.computed(function () {
            var paymentAmount = 0;

            // calculate the paymentamount
            var amount = self.cents_per_point * self.points();
            if (!_.isNaN(amount)) {
                paymentAmount = amount;
            }

            // return formatted payment amount
            return '€ ' + paymentAmount.toFixed(2);
        });
    }

    classes.PaymentRequestModel = KoPaymentRequestModel;
})(jQuery, app.model.koModels, app.model.koClasses);