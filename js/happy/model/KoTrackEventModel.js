/**
 * TrackEvent Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 * @param {object}      trackEvent  [containing trackevents]
 */
(function ($, models, classes, trackEvent) {
    'use strict';

    /**
     * TrackEvent Knockout Model
     * Handle Track Events in Google Analytics
     *
     * @constructor
     */
    function KoTrackEventModel() {
        this.totalTrackEvents = ko.observableArray();

        // check if app.model contains track events on init
        if (!_.isEmpty(trackEvent.category) && !_.isEmpty(trackEvent.action)) {
            this.add(trackEvent.category, trackEvent.action, !_.isEmpty(trackEvent.label) ? trackEvent.label : null);
        }

        // bind scope
        this._autoBind();
    }

    KoTrackEventModel.prototype = {
        constructor: KoTrackEventModel,

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
         * Add track event
         * @param {event} event
         */
        addFromDataAttributes: function (event) {
            var _this = this,
                element = getElementFromArguments(arguments),
                fields = extractDataFieldsFromElement(element);

            if (_.isElement(element)) {

                // throw an error when category or action is empty
                if (_.isEmpty(fields.category) || _.isEmpty(fields.action)) {
                    $.error('To add a track event, please make sure you provide a category and an action');
                    return;
                }

                // add to track events array
                _this.totalTrackEvents(fields);

                // call the track event in google analytics
                if (!_this.add(fields.category, fields.action, fields.label, fields.value, fields.non_interaction) && !_.isUndefined(console) && _.isFunction(console.warn)) {
                    console.warn('Could not add track event to Google Analytics');
                }
            }
        },

        /**
         * Add track event manually by given parameters
         *
         * @param   {string}    category
         * @param   {string}    action
         * @param   {string}    label           [optional]
         * @param   {string}    value           [optional]
         * @param   {string}    non_interaction [optional]
         * @return  {boolean}
         */
        add: function (category, action, label, value, non_interaction) {
            var added = false;

            if (!_.isUndefined(window._gaq)) {

                // throw an error when category or action is empty
                if (_.isEmpty(category) || _.isEmpty(action)) {
                    $.error('To add a track event, please make sure you provide a category and an action');
                    return false;
                }

                // add to 'track events' array
                this.totalTrackEvents.push({
                    category: category,
                    action: action,
                    label: label,
                    value: value,
                    non_interaction: non_interaction
                });

                // call the track event in google analytics
                window._gaq.push(['_trackEvent', category, action, label, value, non_interaction]);
                added = true;
            }

            return added;
        }
    };

    /**
     * Extract data attribute values from a element
     *
     * @param {element} element
     * @return {object}
     */
    function extractDataFieldsFromElement(element) {
        return {
            'category': $(element).attr('data-trackevent-category') ? $(element).attr('data-trackevent-category') : '',
            'action': $(element).attr('data-trackevent-action') ? $(element).attr('data-trackevent-action') : '',
            'label': $(element).attr('data-trackevent-label') ? $(element).attr('data-trackevent-label') : '',
            'value': $(element).attr('data-trackevent-value') ? $(element).attr('data-trackevent-value') : '',
            'non_interaction': $(element).attr('data-trackevent-non-interaction') ? $(element).attr('data-trackevent-non-interaction') : ''
        };
    }

    /**
     * Get element from arguments
     *
     * @param  {array} args
     * @return {element}
     */
    function getElementFromArguments(args) {
        var element = null;

        for (var i = 0; i < args.length; i++) {
            var argument = args[i];

            // when argument itself is an element
            if (_.isElement(argument)) {
                element = argument;
                break;
            }

            // when the argument is an event object, get the currentTarget as element
            if (_.isObject(argument) && _.has(argument, 'currentTarget') && _.isElement(argument.currentTarget)) {
                element = argument.currentTarget;
                break;
            }
        }

        return element;
    }

    // assign track event class
    classes.TrackEvent = KoTrackEventModel;

})(jQuery, app.model.koModels, app.model.koClasses, app.model.trackEvent);