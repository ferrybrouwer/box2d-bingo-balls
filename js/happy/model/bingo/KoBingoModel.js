/**
 * Bingo Knockout Model
 *
 * @param {object} models   [contains class instances]
 * @param {object} classes  [contains classes]
 * @param {object} paths    [Contains paths]
 */
(function (models, classes, paths) {
    'use strict';

    /**
     * Knockout Bingo Model
     * @constructor
     */
    function KoBingoModel() {
        this.use_flash = !(Modernizr.csstransforms3d && Modernizr.canvas) || (_.has(app.model.bingo, 'forceFlash') && app.model.bingo.forceFlash === true);
        this.is_draw = _.has(app.model.bingo, 'bingodraw') ? app.model.bingo.bingodraw : false;
        this.sound_settings = _.extend(this.sound_settings, _.has(app.model.bingo, 'sounds') ? app.model.bingo.sounds : {});
        this.notification_message = ko.observable('').extend({notify: 'always'});
        this.points_total = ko.observable(0);
        this.cards = ko.observableArray();
        this.completed = ko.observable(false);
        this.completed.subscribe(this._isCompleted, this);
        this.is_paused = ko.observable(false);
        this.show_bowl = ko.observable(false);
        this.draw_started = ko.observable(false);
        this.balls = _.has(app.model.bingo, 'balls') ? _.uniq(app.model.bingo.balls) : [];
        this.current_view = ko.observable();
        this.current_view.subscribeChanged(this._viewChanged, this);
        this.initialize();
    }

    /* -----------------------------------
     Bingo constants
     ------------------------------------- */
    KoBingoModel.colors = ['#bdcd00', '#01b1e4', '#ec7bab', '#ec7503', '#f9b200'];
    KoBingoModel.days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];
    KoBingoModel.views = {
        PRELOAD: 'bingo-preload',
        INTRO: 'bingo-intro',
        CARDS: 'bingo-cards',
        OUTRO: 'bingo-outro'
    };

    /* -----------------------------------
     Bingo prototype
     ------------------------------------- */
    KoBingoModel.prototype = {
        constructor: KoBingoModel,
        use_flash: false,
        flash_bingo: null,
        is_paused: false,
        is_draw: false,
        show_bowl: false,
        canvas_bowl: null,
        balls: [],
        current_ball_index: 0,
        bingo_interval: null,
        box2d: null,
        points_per_ball: 1,
        points_total: 0,
        current_view: null,
        cards: [],
        sound_settings: {enabled: false, intro: '', outro: '', match: [], bingo: [], balls: {}},
        sounds: null,
        completed: false,
        notification_message: '',

        /**
         * Initialize bingo model
         */
        initialize: function () {
            this._autoBind();
            this._initBingoCards();
            this._initPoints();

            // initialize flash version if we have to use flash
            if (this.use_flash) {
                this.flash_bingo = new classes.BingoFlashModel();
            }

            if (this.is_draw) {

                // initialize sounds when is enabled, after loading sounds show intro
                // when sounds are disabled. show intro directly
                if (this.sound_settings.enabled && Detectizr.os.name !== 'ios') {
                    this.showView(KoBingoModel.views.PRELOAD);
                    this._initSounds();
                } else {
                    this.showView(KoBingoModel.views.INTRO);
                }

                // if support html5 init the bowl
                if (!this.use_flash) {
                    this.box2d = new app.ui.box2d.Box2dBowl();
                }
            } else {
                
                this.showView(KoBingoModel.views.CARDS);
            }
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
         * Initialize bingo points
         * @private
         */
        _initPoints: function () {
            // bingo points per ball
            this.points_per_ball = ko.computed(function () {
                var points = 0;
                // NOTE: aangepast naar this.cards()
                _.each(this.cards(), function (card, i) {
                    if (!isNaN(card.pointsLastLabel())) {
                        points += card.pointsLastLabel();
                    }
                });

                return points;
            }, this).extend({
                throttle: 200,
                notify: 'always'
            });

            // when bingo points per ball updates notify bingo points and update user balance
            this.points_per_ball.subscribe(function (points) {
                if (points > 0) {
                    this._notifyBingoPoints(points);
                    if (!_.has(app.model.bingo, 'alreadyViewed') && app.model.bingo.alreadyViewed === false) {
                        this._updateUserBalance(points);
                    }
                } else {
                    this.notification_message('');
                }
            }, this);
        },

        /**
         * Initialize bingo cards
         * @private
         */
        _initBingoCards: function () {
            _.each(app.model.bingo.cards, (function (cardData, i) {
                _.extend(cardData, {
                    color: KoBingoModel.colors[i],
                    day: KoBingoModel.days[i]
                });
                this.cards.push(new classes.BingoCardModel(cardData));
            }).bind(this));
        },

        /**
         * Initialize sounds
         * @private
         */
        _initSounds: function () {
            var BingoSounds = app.ui.BingoSounds;

            this.sounds = new BingoSounds(this.sound_settings, {
                debugMode: false,
                flashVersion: 10,
                url: paths.flash + 'soundmanager2/',
                allowScriptAccess: 'always'
            });

            this.sounds.addEventListener(BingoSounds.events.PROGRESS, this._soundLoadHandler);
            this.sounds.addEventListener(BingoSounds.events.COMPLETE, this._soundLoadHandler);
            this.sounds.addEventListener(BingoSounds.events.ERROR, this._soundLoadHandler);
            this.sounds.load();
        },

        /**
         * Sound load handler
         * @param {object} e
         * @private
         */
        _soundLoadHandler: function (e) {
            switch (e.type) {
                case app.ui.BingoSounds.events.PROGRESS:
                    // update progress model
                    models.progressModel.progress(e.target.progress);
                    break;
                case app.ui.BingoSounds.events.COMPLETE:
                    // sounds all loaded successfully,
                    // after 700ms show intro view
                    setTimeout((function () {
                        this.showView(KoBingoModel.views.INTRO);
                    }).bind(this), 700);
                    break;
                case app.ui.BingoSounds.events.ERROR:
                    // an error occurs during loading sounds,
                    // output error to the console
                    console.error(e.target.message);
                    break;
            }
        },

        /**
         * Notify bingo points
         * @param {number} points
         * @private
         */
        _notifyBingoPoints: function (points) {
            this.notification_message('--- + ' + points.toString() + ' bingopunten! ---');
        },

        /**
         * Update user balance
         * @param {number} points
         * @private
         */
        _updateUserBalance: function (points) {
            if (_.has(models, 'userModel')) {
                models.userModel.balance(parseInt(models.userModel.balance()) + points);
            }
        },

        /**
         * Strike labels on cards by given label and color
         * @param {string} label
         * @param {string} color
         * @private
         */
        _strikeLabelsOnCards: function (label, color) {
            var self = this;

            // set data to card models
            _.each(this.cards(), (function (cardModel) {
                cardModel.strikeBall(label, color);
            }).bind(this));

            // update flash if is set
            if (this.use_flash) {
                this.flash_bingo.strikeLabelsOnCards(label, color);
            }
        },

        /**
         * Subscriber when view has changed
         * @param {string} prevView
         * @param {string} nextView
         * @private
         */
        _viewChanged: function (prevView, nextView) {

            // animate out the old view
            if (prevView && prevView !== KoBingoModel.views.CARDS) {
                var prevViewElement = $('.bingo *[data-view="' + prevView + '"]').get(0);
                if (prevViewElement) {
                    if (Modernizr.csstransforms3d) {
                        prevViewElement.style[Modernizr.prefixed('transform')] = 'translateY(-320px)';
                    } else {
                        TweenLite.to(prevViewElement, 1, {top: '-100%'});
                    }
                }
            }

            // animate new view in
            if (nextView) {
                var nextViewElement = $('.bingo *[data-view="' + nextView + '"]').get(0);
                if (nextViewElement) {
                    if (Modernizr.csstransforms3d) {
                        nextViewElement.style[Modernizr.prefixed('transform')] = 'translateY(0)';
                    } else {
                        TweenLite.to(nextViewElement, 1, {top: '0'});
                    }
                }

                // view specific actions
                switch (nextView) {
                    case KoBingoModel.views.INTRO:
                        // play intro sound
                        if (this.sounds) {
                            this.sounds.playIntro();
                        }
                        break;
                    case KoBingoModel.views.CARDS:
                        // start bingo draw
                        if (this.is_draw) {
                            this.draw();
                        }

                        // tell flash all cards can be shown
                        if (this.is_draw && this.use_flash) {
                            this.flash_bingo.showCards();
                        }
                        break;
                    case KoBingoModel.views.OUTRO:

                        // stop updating world
                        this.pause();

                        // tell flash to hide cards
                        if (this.use_flash) {
                            this.flash_bingo.hideCards();
                        }

                        // play outro sound
                        if (this.sound_settings.enabled) {
                            this.sounds.playOutro();
                        }
                        break;
                }
            }
        },

        /**
         * Subscriber when bingo completed observable has changed
         * @param {boolean} isCompleted
         * @private
         */
        _isCompleted: function (isCompleted) {
            if (isCompleted === true) {
                // when user model is available, show user balance as notification
                if (_.has(models, 'userModel')) {
                    this.notification_message('--- Je nieuwe saldo: ' + models.userModel.formattedBalance() + ' bingopunten!  ---');
                }

                // stop box2d from updating world after 5s
                if (!this.use_flash) {
                    this.box2d.stopUpdateWorld();
                } else {
                    this.flash_bingo.stopUpdatingWorld();
                }

                // show outro view
                this.showView(KoBingoModel.views.OUTRO);
            }
        },

        /**
         * Add bingo ball
         * @param   {string}    ball
         * @param   {function}  callback [optional]
         * @private
         */
        _addBingoBall: function (ball, callback) {

            // set current ball index
            this.current_ball_index = _.indexOf(this.balls, ball);

            // get random ball color
            var ball_color = KoBingoModel.colors[Math.floor(Math.random() * KoBingoModel.colors.length)];

            // add ball to world to html5 or flash
            if (!this.use_flash) {
                this.box2d.addBall(ball, ball_color);
            } else {
                this.flash_bingo.addBall(ball, ball_color);
            }

            // play sounds when is enabled
            if (this.sound_settings.enabled) {
                setTimeout(_.bind(function () {

                    this.sounds.playBall(ball, _.bind(function () {

                        // strike hits on cards
                        // check if there has been a match or a bingo
                        var counts = {
                            bingo: {before: 0, after: 0},
                            match: {before: 0, after: 0}
                        };

                        // store before values
                        _.each(this.cards(), function (card) {
                            if (!card.disabled()) {
                                counts.match.before += card.striked().length;
                                counts.bingo.before += card.bingo() ? 1 : 0;
                            }
                        });

                        // strike all cards
                        this._strikeLabelsOnCards(ball, ball_color);

                        // store after values
                        _.each(this.cards(), function (card) {
                            if (!card.disabled()) {
                                counts.match.after += card.striked().length;
                                counts.bingo.after += card.bingo() ? 1 : 0;
                            }
                        });

                        // compare if there's a new entry
                        var match = counts.match.after > counts.match.before,
                            bingo = counts.bingo.after > counts.bingo.before;

                        // play bingo or match sound
                        if (bingo) {
                            this.sounds.playBingo(callback);
                        } else if (match) {
                            this.sounds.playMatch(callback);
                        } else {
                            if (_.isFunction(callback)) {
                                callback();
                            }
                        }
                    }, this));

                }, this), 1000);
            } else {

                // strike all cards
                setTimeout(_.bind(function () {
                    this._strikeLabelsOnCards(ball, ball_color);
                }, this), 2000);

                // call in callback when ball is a while on screen
                if (_.isFunction(callback)) {
                    setTimeout(callback, 4000);
                }
            }
        },

        /**
         * Get card bingo observable by given index
         * @param  {int} index
         * @return {boolean}
         */
        getCardBingoByIndex: function (index) {
            return (_.size(this.cards()) - 1 < index) ? false : this.cards()[index].bingo();
        },

        /**
         * Start bingo draw
         */
        draw: function () {
            this.draw_started(true);

            // show bowl for drawing balls
            this.show_bowl(true);

            // start update world (physics) for html5 or flash
            if (!this.use_flash) {
                this.box2d.updateWorld();
            } else {
                this.flash_bingo.updateWorld();
            }

            // add balls to world
            this._addBingoBall(this.balls[this.current_ball_index], _.bind(this._recursiveAddball, this));
        },

        /**
         * Recursive add balls to the bingo draw
         * @private
         */
        _recursiveAddball: function () {
            var quit = false;
            var r = _.bind(function () {
                if (this.current_ball_index === this.balls.length - 1) {
                    this.completed(true);
                }
                if (!this.is_paused() && this.current_ball_index < this.balls.length - 1) {
                    var ball = this.balls[this.current_ball_index + 1];
                    this._addBingoBall(ball, _.bind(r, this));
                }
            }, this);
            r();
        },

        /**
         * Show new view
         * @param {string} view
         */
        showView: function (view) {
            if (this.current_view() !== view) {
                this.current_view(view);
            }
        },

        /**
         * Pause bingo draw
         */
        pause: function () {
            this.is_paused(true);

            if (this.completed() === false) {
                if (!this.use_flash) {
                    this.box2d.immediatelyStopUpdateWorld();
                } else {
                    this.flash_bingo.stopUpdatingWorld();
                }
            }
        },

        /**
         * Resume bingo draw
         */
        resume: function () {
            this.is_paused(false);

            if (this.completed() === false && this.draw_started() === true) {
                if (!this.use_flash) {
                    this.box2d.updateWorld();
                } else {
                    this.flash_bingo.updateWorld();
                }

                this._recursiveAddball();
            }
        }
    };

    if (_.has(app.model, 'bingo')) {
        classes.BingoModel = KoBingoModel;
    }

})(app.model.koModels, app.model.koClasses, app.model.paths);