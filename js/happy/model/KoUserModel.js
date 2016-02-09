/**
 * User Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 */
(function($, models, classes) {

    /**
     * Extend Number Class with format number
     * Format number, example: 1000 -> 1.000 and 10000000 -> 1.000.000
     * 
     * @this  {Number}
     * @return {String}
     */
    Number.prototype.toBingoPoints = function(){
        var decimalSeparator = '.',
            thousandsSeparator = '.',
            nDecimalDigits = 0;
            fixed = this.toFixed(nDecimalDigits),
            parts = new RegExp('^(-?\\d{1,3})((?:\\d{3})+)(\\.(\\d{'+ nDecimalDigits +'}))?$').exec( fixed );

        return parts ? parts[1] + parts[2].replace(/\d{3}/g, thousandsSeparator + '$&') + (parts[4] ? decimalSeparator + parts[4] : '') : fixed.replace('.', decimalSeparator);
    };

    /**
     * Kockout User Model
     * @constructor
     */
    function KoUserModel(){
        // bind all app.model.user properties as observables
        if ( _.has(window.app.model, 'user') ){
            _.each(window.app.model.user, _.bind(function(value, key) {
                this[key] = ko.observable(value);
            }, this));
        }

        // assign class properties
        this.formattedBalance = ko.computed(this._formattedBalance, this);
        this.saldoText = ko.computed(this._saldoText, this);

        // bind scope
        this._autoBind();
    }

    KoUserModel.prototype = {
        constructor: KoUserModel,

        /**
         * Autobind all methods
         * @return {void}
         */
        _autoBind: function () {
            _.each(_.without(_.functions(this.constructor.prototype), 'constructor', 'autoBind'), (function (func) {
                _.bindAll(this, func);
            }).bind(this));
        },

        /**
         * Format balance points
         *
         * @return {string}
         * @private
         */
        _formattedBalance: function() {
            var balance = _.has(this, 'balance') ? this.balance() : 0;
            if (typeof(balance) != 'Number') {
                balance = Number(balance);
            }
            return balance.toBingoPoints();
        },

        /**
         * Saldo text
         *
         * @return {string}
         * @private
         */
        _saldoText: function() {
            return 'Jouw saldo: ' + this.formattedBalance() + ' bingopunten';
        }
    };

    // assign class
    classes.UserModel = KoUserModel;

})(jQuery, app.model.koModels, app.model.koClasses);