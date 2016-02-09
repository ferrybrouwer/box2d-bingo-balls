/**
 * Bingo Sounds
 * @author Ferry Brouwer <ferry@happy-online.nl>
 *
 * @usage    var bs = new BingoSounds({
 *         		intro:'',
 *         		outro:'',
 *         		matches:[],
 *         		bingo: [],
 *         		balls: {}
 *         	}, {debugMode: true});
 *
 *            bs.addEventListener(BingoSounds.events.PROGRESS, callbackProgress);
 *            bs.addEventListener(BingoSounds.events.COMPLETE. callbackComplete);
 *            bs.addEventListener(BingoSounds.events.ERROR. callbackError);
 *            bs.load();
 */
(function () {
    "use strict";

    /**
     * Class BingoSounds
     *
     * @constructor
     * @param {object} soundObject
     * @param {object} settings
     */
    function BingoSounds(soundObject, settings) {
        this.sources = _.chain(soundObject)
            .map(function (l) {
                return _.isObject(l) ? _.flatten(l) : l;
            })
            .flatten(soundObject)
            .reject(_.isBoolean)
            .value();

        settings = _.extend(this.settings, settings);
        settings.onready = this.initialize.bind(this, _.extend(_.clone(this.sounds), soundObject));
        soundManager.setup(settings);
    }

    /**
     * Define Type constants
     * @type {object}
     */
    BingoSounds.types = {
        INTRO: 'intro',
        OUTRO: 'outro',
        MATCH: 'match',
        BINGO: 'bingo',
        BALL: 'ball'
    };

    /**
     * Define Event constants
     * @type {object}
     */
    BingoSounds.events = {
        PROGRESS: "progress",
        COMPLETE: "complete",
        ERROR: "error",
        INITIALIZED: "initialized"
    };

    BingoSounds.prototype = {

        /**
         * Contain sound sources to load
         * @type {Array}
         */
        sources: [],

        /**
         * Object where the SMobject instances are stored
         * @type {Object}
         */
        sounds: {
            match: [],
            bingo: [],
            balls: {},
            intro: '',
            outro: ''
        },

        /**
         * Default settings
         * @type {Object}
         */
        settings: {
            url: window.app.model.paths.flash + 'soundmanager2/',
            flashVersion: 9,
            debugMode: false
        },

        /**
         * Initialize method which adds sound objects
         * Dispatch Initialized event when all sound objects are set
         *
         * @param   {object}    soundObject
         * @return  {void}
         */
        initialize: function (soundObject) {
            var _this = this;

            if (_.isAudio(soundObject.intro)) {
                this.addSound(BingoSounds.types.INTRO, 'intro', soundObject.intro);
            }
            if (_.isAudio(soundObject.outro)) {
                this.addSound(BingoSounds.types.OUTRO, 'outro', soundObject.outro);
            }

            _.each(soundObject.match, function (src, i) {
                if (_.isAudio(src)) {
                    _this.addSound(BingoSounds.types.MATCH, 'match_' + i, src);
                }
            });
            _.each(soundObject.bingo, function (src, i) {
                if (_.isAudio(src)) {
                    _this.addSound(BingoSounds.types.BINGO, 'bingo_' + i, src);
                }
            });
            _.each(soundObject.balls, function (src, label) {
                if (_.isAudio(src)) {
                    _this.addSound(BingoSounds.types.BALL, 'ball_' + label, src);
                }
            });

            this.dispatchEvent(BingoSounds.events.INITIALIZED);
        },

        /**
         * Add sound object (SMobject instance) and add
         * the object to BingoSounds.sounds
         *
         * @param   {string}    type
         * @param   {string}    id
         * @param   {string}    url
         * @return  {void}
         */
        addSound: function (type, id, url) {
            var sound = soundManager.createSound({
                id: id,
                url: url,
                autoPlay: false,
                autoLoad: false
            });

            switch (type) {
                case BingoSounds.types.INTRO:
                    this.sounds.intro = sound;
                    break;
                case BingoSounds.types.OUTRO:
                    this.sounds.outro = sound;
                    break;
                case BingoSounds.types.MATCH:
                    this.sounds.match.push(sound);
                    break;
                case BingoSounds.types.BINGO:
                    this.sounds.bingo.push(sound);
                    break;
                case BingoSounds.types.BALL:
                    this.sounds.balls[id.replace('ball_', '')] = sound;
                    break;
            }
        },

        /**
         * Get flatten array of Sound Objects
         *
         * @return  {Array}
         */
        getFlattenSoundsObject: function () {
            return _.chain(this.sounds)
                .map(function (s) {
                    return s.constructor.name === 'Object' ? _.flatten(s) : s;
                })
                .reject(_.isEmpty)
                .flatten(this.sounds)
                .value();
        },

        /**
         * Load sounds
         *
         * @return  {void}
         */
        load: function () {
            var _this = this,
                preloaded = false,
                soundsReady = false,
                queue;

            var loadHandler = function (e) {
                switch (e.type) {
                    case 'progress':
                        this.dispatchEvent(BingoSounds.events.PROGRESS, {
                            progress: queue.progress * 100
                        });
                        break;
                    case 'complete':
                        preloaded = true;
                        if (soundsReady) {
                            this.dispatchEvent(BingoSounds.events.COMPLETE);
                        }
                        break;
                    case 'error':
                        this.dispatchEvent(BingoSounds.events.ERROR, {
                            message: 'Error: could not load ' + e.item.src
                        });
                        queue.remove(_this.sources);
                        _this.dispatchEvent(BingoSounds.events.COMPLETE);
                        break;
                }
            };

            // preload sounds with preloadJS
            queue = new createjs.LoadQueue();

            // use createjs.Sound lib to load sounds
            createjs.Sound.alternateExtensions = ['mp3'];
            queue.installPlugin(createjs.Sound);

            // attach queue events
            queue.on('progress', loadHandler.bind(this));
            queue.on('complete', loadHandler.bind(this));
            queue.on('error', loadHandler.bind(this));
            queue.loadManifest(this.sources);

            // wait till all sounds are ready for playback
            // using the sound manager library
            var soundsReadyCount = 0;
            var setOnloads = function () {
                var sounds = this.getFlattenSoundsObject();

                _.each(sounds, function (sound) {
                    if (!_.isUndefined(sound.options)) {
                        var checkDispatch = function () {
                            soundsReadyCount++;
                            if (!soundsReady && soundsReadyCount === sounds.length) {
                                soundsReady = true;
                                if (preloaded) {
                                    _this.dispatchEvent(BingoSounds.events.COMPLETE);
                                }
                            }
                        };

                        if (sound.isHTML5) {
                            sound.options.whileloading = function () {
                                var p = (this.bytesLoaded / this.bytesTotal) * 100;
                                if (p === 100 || this.readyState === 1) {
                                    checkDispatch();
                                }
                            };
                            sound.options.onload = function () {
                                checkDispatch();
                            };
                        } else {
                            sound.options.whileloading = function () {
                                var p = (this.bytesLoaded / this.bytesTotal) * 100;
                                if (p === 100 || this.readyState === 3) {
                                    checkDispatch();
                                }
                            };
                        }

                        sound.load();
                    }
                });
            };


            if (_.isUndefined(soundManager.ok()) || !soundManager.ok()) {
                this.addEventListener(BingoSounds.events.INITIALIZED, _.bind(function (e) {
                    setOnloads.call(this);
                }, this));
            } else {
                setOnloads.call(this);
            }
        },

        /**
         * Get highest duration of sound objects
         *
         * @return {number}
         */
        getHighestDuration: function () {
            var highestDuration = 0;
            _.each(this.getFlattenSoundsObject(), function (sound) {
                highestDuration = Math.max(highestDuration, sound.duration);
            });
            return highestDuration;
        },

        /**
         * Play ball label sound
         *
         * @param   {string}    label
         * @param   {function}  callback
         * @return  {void}
         */
        playBall: function (label, callback) {
            if (soundManager.ok() && !_.isUndefined(this.sounds.balls[label.toString()])) {
                var sound = this.sounds.balls[label.toString()];
                sound.play({
                    onfinish: function () {
                        if (_.isFunction(callback)) {
                            callback(sound);
                        }
                    }
                });
            } else if (_.isFunction(callback)) {
                callback();
            }
        },

        /**
         * Play intro sound
         *
         * @param   {function}  callback
         * @return  {void}
         */
        playIntro: function (callback) {
            var _this = this;
            if (soundManager.ok() && this.sounds.intro) {
                this.sounds.intro.play({
                    onfinish: function () {
                        if (_.isFunction(callback)) {
                            callback(_this.sounds.intro);
                        }
                    }
                });
            } else if (_.isFunction(callback)) {
                callback();
            }
        },

        /**
         * Play outro sound
         *
         * @param   {function}  callback
         * @return  {void}
         */
        playOutro: function (callback) {
            var _this = this;
            if (soundManager.ok() && this.sounds.outro) {
                this.sounds.outro.play({
                    onfinish: function () {
                        if (_.isFunction(callback)) {
                            callback(_this.sounds.outro);
                        }
                    }
                });
            } else if (_.isFunction(callback)) {
                callback();
            }
        },

        /**
         * Play match sound
         *
         * @param   {function}  callback
         * @return  {void}
         */
        playMatch: function (callback) {
            if (soundManager.ok() && this.sounds.match.length > 0) {
                var index = parseInt(Math.random() * this.sounds.match.length),
                    sound = this.sounds.match[index];

                sound.play({
                    onfinish: function () {
                        if (_.isFunction(callback)) {
                            callback(sound);
                        }
                    }
                });
            } else if (_.isFunction(callback)) {
                callback();
            }
        },

        /**
         * Play bingo sound
         *
         * @param   {function}  callback
         * @return  {void}
         */
        playBingo: function (callback) {
            if (soundManager.ok() && this.sounds.bingo.length > 0) {
                var index = parseInt(Math.random() * this.sounds.bingo.length),
                    sound = this.sounds.bingo[index];

                sound.play({
                    onfinish: function () {
                        if (_.isFunction(callback)) {
                            callback(sound);
                        }
                    }
                });
            } else if (_.isFunction(callback)) {
                callback();
            }
        }
    };

    createjs.EventDispatcher.initialize(BingoSounds.prototype);
    window.app.ui.BingoSounds = BingoSounds;
})();