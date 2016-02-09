/**
 * Redeem Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 */
(function ($, models, classes) {
    'use strict';

    /**
     * Redeem Knockout Model
     * @constructor
     */
    function KoRedeemModel() {
        this.$views = $('.redeem-price section[data-view]');
        this.currentview = ko.observable(this.$views.first().get(0));

        // bind scope
        this._autoBind();
    }

    KoRedeemModel.prototype = {
        constructor: KoRedeemModel,

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
         * Show next view
         *
         * @param   {string} view [section data-view field]
         * @return  {void}
         */
        showView: function (view) {
            var _this = this;

            // overwrite view string with HTMLelement view
            view = $('section[data-view="' + view + '"]').get(0);

            if (!_.isUndefined(_this.currentview()) && view) {
                var indexCurrentview = _.indexOf(_this.$views, _this.currentview()),
                    indexView = _.indexOf(_this.$views, view),
                    leftValueCurrentview = (indexView > indexCurrentview) ? '-150%' : '150%';

                // animate view out
                TweenLite.to(_this.currentview(), 1, {
                    left: leftValueCurrentview,
                    ease: 'Power2.easeInOut'
                });

                // animate view in
                TweenLite.to(view, 1, {
                    left: '50%',
                    ease: 'Power2.easeInOut',
                    onComplete: function () {

                        // set all which are on the left side and
                        // higher indexed as currentview on the starting positon
                        _.each(_.without(_this.$views, view), function (v, i) {
                            var viewIndex = _.indexOf(_this.$views, v),
                                currentviewIndex = _.indexOf(_this.$views, view);

                            if (currentviewIndex < viewIndex && v.style.left == '-150%') {
                                v.style.left = '150%';
                            }
                        });
                    }
                });
                _this.currentview(view);
            }

            // restart playing video
            if ($(view).attr('data-view') == 'video') {
                models.vzaarModel.replayVideo();
            }
        },

        /**
         * Get current view data field
         *
         * @return {string}
         */
        getView: function() {
            return $(this.currentview()).attr('data-view');
        }
    };

    // assign class model
    classes.RedeemModel = KoRedeemModel;

})(jQuery, app.model.koModels, app.model.koClasses);