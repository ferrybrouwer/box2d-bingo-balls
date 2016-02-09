/**
 * Notification Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 */
(function ($, models, classes) {
    'use strict';

    var container = $('#notificationbar .wrapper').get(0);

    /**
     * Single span item
     *
     * @constructor
     * @param {string} text
     * @param {number} duration [optional]
     */
    function SpanItem(text, duration) {
        var self = this;
        self.span = document.createElement('span');
        self.span.innerHTML = text;
        self.spanHeight = $(container).height();
        self.instance = self;
        self.tId = null;

        // set initialize properties of span
        TweenLite.set(self.span, {
            y: self.spanHeight,
            visibility: 'visible',
            autoAlpha: 0
        });

        // append span to container
        container.appendChild(self.span);

        // when duration is set, set timeout
        // when timeout is reached, invoke the animateOut method
        if (_.isNumber(duration)) {
            self.tId = setTimeout(function () {
                clearTimeout(self.tId);
                self.animateOut();
            }, duration);
        }

        // bind scope
        this._autoBind();

        // return instance 
        // this will be set to null when animation is completed
        return self.instance;
    }

    SpanItem.prototype = {
        constructor: SpanItem,

        /**
         * Autobind all methods
         * @return {void}
         */
        _autoBind: function () {
            _.each(_.without(_.functions(this.constructor.prototype), 'constructor', 'autoBind'), (function (func) {
                _.bindAll(this, func);
            }).bind(this));
        },

        animateIn: function () {
            TweenLite.to(this.span, .6, {
                y: 0,
                alpha: 1,
                ease: 'Back.easeInOut'
            });
        },
        animateOut: function () {
            var self = this;

            // when self.tId is set
            // clear the timeout
            if (_.isNumber(self.tId)) {
                clearTimeout(self.tId);
            }

            TweenLite.to(this.span, .4, {
                y: -this.spanHeight,
                autoAlpha: 0,
                ease: 'Back.easeInOut',
                onComplete: function () {
                    if (container.contains(self.span)) {
                        container.removeChild(self.span);
                    }
                    self.instance = null;
                }
            });
        }
    }

    /**
     * Notification Knockout Model
     * @constructor
     */

    function KoNotificationModel() {
        var self = this,
            canNotify = document.getElementById('notificationbar') ? true : false,
            currentSpanItem;

        // check if notify bar exist
        if (canNotify) {
            currentSpanItem = new SpanItem($(container).children('span').text());

            // animate existing item in on initialize
            currentSpanItem.animateIn();
        }

        /**
         * Show new notification
         *
         * @param {string} message
         * @param {int} duration
         * @return {void}
         */
        self.showNotification = function (message, duration) {
            if (canNotify) {
                if (!_.isNull(currentSpanItem)) {
                    currentSpanItem.animateOut();
                }

                currentSpanItem = new SpanItem(message, duration);
                currentSpanItem.animateIn();
            }
        }
    }

    // assign class instance
    classes.NotificationModel = KoNotificationModel;

})(jQuery, app.model.koModels, app.model.koClasses);