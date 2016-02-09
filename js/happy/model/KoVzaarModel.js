/**
 * User Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 */
(function($, models, classes) {

	// extend event bindings with video bindings
	_.extend(ko.bindingHandlers, {
        videoProgress: {
			init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
				// create video player if isn't set
				if (!viewModel.vzaarModel.vzPlayer){
					createVzaarPlayer(element.id);
				}

				// push progress event
				viewModel.vzaarModel.events.push({
					eventName: 'progress',
					handler: valueAccessor()
				});
			}
		},
		playState: {
			init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
				// create video player if isn't set
				if (!viewModel.vzaarModel.vzPlayer){
					createVzaarPlayer(element.id);
				}

				// push progress event
				viewModel.vzaarModel.events.push({
					eventName: 'playState',
					handler: valueAccessor()
				});
			}
		},
		complete: {
			init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
				viewModel.vzaarModel.completed.subscribe(function(isCompleted) {
					if (isCompleted) {
						viewModel.vzaarModel.completed(false);
						var callback = valueAccessor();
						callback();
					}
				});
			}
		}
	});

	/**
	 * Create Vzaar Player
	 * When vzaar player is ready, attach events
	 * @return {void}
	 */
	function createVzaarPlayer(element_id) {
		var viewModel = models.vzaarModel;
		viewModel.vzPlayer = new window.vzPlayer(element_id);

		viewModel.vzPlayer.ready(function() {
            viewModel.isReady(true);

			_.each(viewModel.events, function(event) {
				viewModel.vzPlayer.addEventListener(event.eventName, event.handler);

				if (event.eventName === 'progress' && !viewModel.intervalID) {
					customProgressHandler(viewModel, event.handler);
				}
			});
		});
	}

	/**
	 * Start custom progress handler
	 * Recursive Update progress after each getTime callback
     * Progress callback from vzaar only dispatch each 10%.
     * This method creates a more accurated time measurement
     *
	 * @param  {KoVzaarModel}   _viewModel
	 * @param  {function}       _eventHandler
	 * @return {void}
	 */

	function customProgressHandler(_viewModel, _eventHandler) {
		// reset interval complete state
		_viewModel.clearInterval(false);

		var obj = {};
	    var recursiveGetTime = function() {

            // get current time
            _viewModel.vzPlayer.getTime(function(time) {
                obj.currentTime = time;

                if (_.has(obj, 'totalTime')) {
                    // calculate and dispatch percentage
                    var percentage = Math.ceil((obj.currentTime / obj.totalTime) * 100);
                    _eventHandler(percentage.toString());

                    // call recursive if video isn't completed
                    // set a timeout for preventing overload call to vzaar
                    if (!_viewModel.clearInterval()) {
                        setTimeout(recursiveGetTime, 100);
                    }
                }
            });
        };

		// store total time
		_viewModel.vzPlayer.getTotalTime(function(time) {
			obj.totalTime = time;
			recursiveGetTime();
		});
	}

	/**
	 * Vzaar Knockout Model
	 * Handle redeem module
     *
	 * @constructor
	 */
	function KoVzaarModel() {
		this.events = [];
        this.isReady = ko.observable(false);
		this.clearInterval = ko.observable(false);
		this.completed = ko.observable(false);

		// on update progress of video
		$('section.vzaar-video progress').on('progressUpdate', function(event, element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var progress = _.has(models, 'progressModel') ? models.progressModel.progress() : 0;

            // when percentage is a number animate progression
            if (!_.isNaN(progress)) {
                var tweenprops = {
                    value: progress,
                    ease: 'Linear.easeNone',
                    onUpdateParams: [element],
                    onUpdate: function(_element) {
                        TweenLite.to('span.progress-percentage', .5, {
                            right: parseInt(100 - progress).toString() + '%'
                        });
                    }
                };
                TweenLite.to(element, .5, tweenprops);
            }
        });

        // bind scope
        this._autoBind();
    }


    KoVzaarModel.prototype = {
        constructor: KoVzaarModel,
        vzPlayer: null,
        intervalID: null,
        isReady: null,
        clearInterval: null,
        completed: null,
        events: [],

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
         * Video updated it's progress
         * Dispatch progress model observable
         *
         * @param   {string} percentage
         * @return  {void}
         */
        videoProgress: function(percentage) {
            // format percentage
            percentage = parseInt(percentage.replace(/[^\d]+/, ''));

            // when progressModel is set, assign progress observable
            if (!_.isNaN(percentage) && _.has(models, 'progressModel')) {
                models.progressModel.progress(percentage);
            }
        },

        /**
         * Video update new state (started, playing, ended)
         * When video ended, clear interval and set progress to completed
         *
         * @param   {string} state
         * @return  {void}
         */
        playState: function(state) {
            switch (state) {
                case 'mediaEnded':
                    if (this.intervalID) {
                        clearInterval(this.intervalID);
                    }

                    this.clearInterval(true);
                    this.completed(true);
                break;
            }
        },

        /**
         * Replay video
         *
         * @return {void}
         */
        replayVideo: function() {
            // reset the custom progress handler
            customProgressHandler(this, this.videoProgress);

            // play the video
            this.vzPlayer.play2();
        },

        /**
         * Pause video if is playing
         *
         * @return {void}
         */
        pause: function() {
            if ( this.vzPlayer && this.isReady() && !this.completed() ) {
                this.vzPlayer.pause();
            }
        },

        /**
         * Play video if video isn't ended
         * @return {void}
         */
        play: function() {
            if ( this.vzPlayer && this.isReady() && !this.completed()  ) {
                this.vzPlayer.play2();
            }
        }
    };

    // assign class
    classes.VzaarModel = KoVzaarModel;

})(jQuery, app.model.koModels, app.model.koClasses);