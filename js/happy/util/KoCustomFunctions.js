(function () {
    'use strict';

    _.extend(ko.subscribable.fn, {

        /**
         * Add subscribe changed function to knockout where we will pass the old and new value when an observable's value changes
         * @param {function} callback
         * @param {object} scope
         */
        subscribeChanged: function (callback, scope) {
            var prevValue;

            this.subscribe(function (_prevValue) {
                prevValue = _prevValue;
            }, scope, 'beforeChange');
            this.subscribe(function (newValue) {
                if (_.isFunction(callback)) {
                    callback.apply(scope, [prevValue, newValue]);
                }
            }, scope);
        }
    });
})();