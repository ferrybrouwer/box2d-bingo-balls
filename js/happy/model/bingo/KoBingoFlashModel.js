(function (models, classes, path) {
    'use strict';

    /**
     * Knockout Bingo Flash Model
     * @constructor
     */
    function KoBingoFlashModel() {
        this.is_draw = _.has(app.model.bingo, 'bingodraw') ? app.model.bingo.bingodraw : false;

        // set flash swf paths
        this.flash_express_swf = path.flash + '/expressInstall.swf';
        this.flash_swf = path.flash + '/bingodraw.swf';

        // set bingo data as flash variable `data`
        this.flash_vars = {
            data: ko.toJSON(app.model.bingo).replace(/["]+/g, '~').toString()
        };

        // flash object default parameters
        this.flash_params = {
            wmode: 'transparent',
            allowscriptaccess: 'always'
        };

        // flash attributes, add id for communication through javascript and flash
        this.flash_attributes = {
            id: this.flash_id
        };

        // when flash bingo draw element exist, setup DOM elements and initialize swf object
        if (document.getElementById(this.flash_id)) {
            this.initialize();
        }
    }

    /* -----------------------------------
     Bingo flash constants
     ------------------------------------- */
    KoBingoFlashModel.swfMethods = {
        SHOW_BOWL: 'showBowl',
        SHOW_CARDS: 'showCards',
        HIDE_CARDS: 'hideCards',
        STRIKE_LABELS_ON_CARDS: 'strikeLabelsOnCards',
        STOP_UPDATE_WORLD: 'stopUpdateWorld',
        UPDATE_WORLD: 'updateWorld',
        ADD_BALL: 'addBall'
    };

    /* -----------------------------------
     Bingo flash prototype
     ------------------------------------- */
    KoBingoFlashModel.prototype = {
        constructor: KoBingoFlashModel,
        is_ready: false,
        is_draw: false,
        flash_id: 'flashBingoDraw',
        flash_width: '100%',
        flash_height: '320',
        flash_version: '10.0.0',
        flash_express_swf: null,
        flash_swf: null,
        flash_vars: {},
        flash_params: {},
        flash_attributes: {},

        /**
         * Initialize knockout bingo flash model
         */
        initialize: function () {
            this._autoBind();
            this._initDOM();
            this._initSwf();
        },

        /**
         * Autobind all methods
         * @private
         */
        _autoBind: function () {
            _.each(_.without(_.functions(this.constructor.prototype), 'constructor', '_autoBind'), (function (func) {
                _.bindAll(this, func);
            }).bind(this));
        },

        /**
         * Initialize HTML DOM elements
         * @private
         */
        _initDOM: function () {
            // show div container flash bingodraw
            if (document.getElementById(this.flash_id)) {
                document.getElementById(this.flash_id).style.display = 'block';
            }

            // hide img blue banner bottom white curve
            if (document.getElementById('bluebannerBottomWhite')) {
                document.getElementById('bluebannerBottomWhite').style.display = 'none';
            }

            // hide the default bingo-cards view
            if (document.getElementById('bingoDrawCards')) {
                document.getElementById('bingoDrawCards').style.display = 'none';
            }
        },

        /**
         * Initialize swf object
         * @private
         */
        _initSwf: function () {
            swfobject.embedSWF(this.flash_swf, this.flash_id, this.flash_width, this.flash_height, this.flash_version, this.flash_express_swf, this.flash_vars, this.flash_params, this.flash_attributes, (function (e) {
                // show flash load error
                if (!e.success || !e.ref) {
                    alert('Kan flash niet laden, waarschijnlijk heeft u de flash player niet geinstalleerd');
                }

                // show cards if there isn't a bingodraw and flash is successfully loaded
                if (!(!e.success || !e.ref)) {
                    setTimeout(_.bind(function () {
                        this.is_ready = true;
                        if (!this.is_draw) {
                            this.showCards();
                        }
                    }, this), 1000);
                }
            }).bind(this));
        },

        /**
         * Show bowl
         */
        showBowl: function () {
            this.callToSwf(KoBingoFlashModel.swfMethods.SHOW_BOWL);
        },

        /**
         * Show cards
         */
        showCards: function () {
            console.log('show cards');
            this.callToSwf(KoBingoFlashModel.swfMethods.SHOW_CARDS);
        },

        /**
         * Hide cards
         */
        hideCards: function() {
            this.callToSwf(KoBingoFlashModel.swfMethods.HIDE_CARDS);
        },

        /**
         * Stop updating world
         */
        stopUpdatingWorld: function () {
            // @todo: enable this external interface method in ActionScript
            // this.callToSwf(KoBingoFlashModel.swfMethods.STOP_UPDATE_WORLD);
        },

        /**
         * Start updating world
         */
        updateWorld: function () {
            // @todo: enable this external interface method in ActionScript
            // this.callToSwf(KoBingoFlashModel.swfMethods.UPDATE_WORLD);
        },

        /**
         * Strike labels on cards
         * @param {string} label
         * @param {string} color
         */
        strikeLabelsOnCards: function (label, color) {
            this.callToSwf(KoBingoFlashModel.swfMethods.STRIKE_LABELS_ON_CARDS, [label, color]);
        },

        /**
         * Add ball to world
         * @param {string} ball
         * @param {string} color
         */
        addBall: function(ball, color) {
            this.callToSwf(KoBingoFlashModel.swfMethods.ADD_BALL, [ball, color]);
        },

        /**
         * Call to swf object using the External Interface Class
         * @param {string} method
         * @param {array} parameters
         */
        callToSwf: function (method, parameters) {
            if (this.is_ready) {
                var swf = (navigator.appName.indexOf('Microsoft') != -1) ? window[this.flash_id] : document[this.flash_id];
                if (!_.isUndefined(swf)) {
                    if (_.isArray(parameters) && parameters.length > 0) {
                        swf[method].apply(swf, parameters);
                    } else {
                        swf[method]();
                    }
                }
            }
        }
    };

    // assign bingo flash model class
    classes.BingoFlashModel = KoBingoFlashModel;

})(app.model.koModels, app.model.koClasses, app.model.paths);