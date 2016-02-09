/**
 * Popup Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 * @param {object}      ui          [user interface elements]
 */
(function ($, models, classes, ui) {
    'use strict';

    // when ui is set, create overlay instance
    if (!_.isUndefined(ui)) {
        ui.overlay = new window.Overlay();
    }

    /**
     * Popup Knockout Model
     * Showing an overlay as popup with given template content
     *
     * @constructor
     */
    function KoPopupModel() {
        var self = this;

        // try to re-assign ui element when this class is being instantiated and ui is not set
        if (_.isUndefined(ui) && !_.isEmpty(window.app.ui)) {
            ui = window.app.ui;
            ui.overlay = new window.Overlay();
        }

        // assign overlay as class property
        this.overlay = ui.overlay || null;

        // autobind all methods to this scope
        this._autoBind();
    }

    KoPopupModel.prototype = {
        constructor: KoPopupModel,

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
         * Open popup
         * @param   {string}    template [template id]
         * @return  {void|false}
         */
        openPopup: function (template) {
            var _this = this;

            // return when template is not set
            if (!document.getElementById(template)) {
                $.error('template: ' + template + ' is not defined');
                return false;
            }

            // return when overlay is not set
            if (!_this.overlay) {
                $.error('overlay is not defined');
                return false;
            }

            // create object to show in popup and add template content
            var $popup = $('<div />')
                .addClass('popup-content ' + template)
                .html(document.getElementById(template).innerHTML);

            // if overlay is open, close it first
            if (_this.overlay.isOpen()) {
                _this.overlay.hide(function () {
                    _this.overlay.show($popup, function () {
                        ui.setPlaceholder();
                        _this._rebindModels();
                    });
                });
            } else {
                _this.overlay.show($popup, function () {
                    ui.setPlaceholder();
                    _this._rebindModels();
                });
            }
        },

        /**
         * Close popup
         * @return {void}
         */
        closePopup: function () {

            // return is overlay is not set
            if (!this.overlay) {
                $.error('overlay is not defined');
                return;
            }

            if (this.overlay.isOpen()) {
                this.overlay.hide();
            }
        },

        /**
         * Rebind knockout models on popup
         * @private
         */
        _rebindModels: function () {
            var node = $('#lightbox-content').get(0) ? $('#lightbox-content').get(0) : $('.overlay-content').get(0);
            ko.cleanNode(node);
            ko.applyBindingsToDescendants(models, node);
        }
    };

    // assign class
    classes.PopupModel = KoPopupModel;

})(jQuery, app.model.koModels, app.model.koClasses, app.ui);