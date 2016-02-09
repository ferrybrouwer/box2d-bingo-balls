/**
 * Knockout bindings
 * @author Ferry Brouwer <ferry@happy-online.nl>
 */
(function(){
    var originalValueBinding = ko.bindingHandlers.value;

    _.extend(ko.bindingHandlers, {

        /**
         * Scroll window to this element
         * @example:
         *  data-bind="scrollToThis: true"
         */
        scrollToThis: {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var doScroll = ko.utils.unwrapObservable(valueAccessor());

                if (doScroll) {
                    var offsetTop = $(element).offset().top;
                    TweenLite.to(window, 1, {scrollTo: {y: offsetTop}, ease: 'Power4.easeInOut'});
                }
            }
        },

        /**
         * Binding Handler for the KoBingoModel which should be attached on the notification UI
         * When notification_message changes, update the notification model
         * @example:
         *  data-bind="bingoNotifyChanges: {text: $root.bingoModel.notify, duration: 5000}"
         */
        bingoNotifyChanges: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                // on init show notify printed in the DOM
                var txt = $(element).find('span:first-child').text();
                viewModel.bingoModel.notification_message(txt);
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                // Don't show point updates if the user already viewed this bingo draw!
                if (app.model.bingo.alreadyViewed == true) {
                    app.model.koModels.notificationModel.showNotification('Je hebt deze trekking al eerder bekeken!');
                    return;
                }

                var eventAccessor = valueAccessor();

                // when accessor is an observable
                if (ko.isObservable(valueAccessor)) {
                    valueAccessor.notifySubscribers(valueAccessor());
                }

                // when accessor is an object
                if (_.isObject(eventAccessor)) {
                    var txt = _.has(eventAccessor, 'text') ? eventAccessor.text : '',
                        duration = _.has(eventAccessor, 'duration') ? eventAccessor.duration : -1;

                    if (ko.isObservable(txt)) {
                        txt.notifySubscribers(txt());
                        txt = txt();
                    }

                    if (_.has(viewModel, 'notificationModel')) {
                        if (duration !== -1) {
                            viewModel.notificationModel.showNotification(txt, duration);
                        } else {
                            viewModel.showNotification(txt);
                        }
                    }
                }
            }
        },

        /**
         * Binding Handler for the KoBingoModel which calls the valueAccessor when the bingo draw is completed
         * @scope: KoBingoModel
         * @example:
         *  data-bind="bingoComplete: function(){console.log('bingo is completed');}"
         */
        bingoComplete: {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                if (viewModel.bingoModel.completed() === true) {
                    var value = ko.utils.unwrapObservable(valueAccessor());
                    if (_.isFunction(value)) {
                        value();
                    }
                }
            }
        },

        /**
         * Binding Handler for the KoBingoModel which should be attached on the bowl canvas
         * Initialize the canvas bowl when should be visible
         * @scope: KoBingoModel
         * @example:
         *  data-bind="visibleBowl: $root.bingoModel.showBowl"
         */
        visibleBowl: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                if (!viewModel.bingoModel.use_flash) {
                    viewModel.bingoModel.canvas_bowl = new app.ui.bingo.CanvasBowl(element);
                }
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var value = ko.utils.unwrapObservable(valueAccessor());

                if (!viewModel.bingoModel.use_flash) {
                    viewModel.bingoModel.canvas_bowl[value ? 'show' : 'hide']();
                } else if (value) {
                    viewModel.bingoModel.flash_bingo.showBowl();
                }
            }
        },

        /**
         * Binding Handler for KoBingoCardModel which adds functionality for showing card when valueAccessor is true
         * This binding handler should be applied on a card
         * @scope: KoBingoCardModel
         * @example:
         *  <article class="card" data-bind="showCard: true">
         */
        showCard: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var bingodraw = app.model.koModels.bingoModel.is_draw,
                    use_flash = app.model.koModels.bingoModel.use_flash,
                    claimed = viewModel.claimed(),
                    disabled = viewModel.disabled();

                viewModel.showLabels = (!(!bingodraw && !claimed));
                viewModel.color((bingodraw && !claimed || disabled) ? '#cecece' : viewModel.color());

                if (!use_flash) {
                    TweenLite.set(element, viewModel.getInitProps());
                }
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var bingodraw = app.model.koModels.bingoModel.is_draw,
                    use_flash = app.model.koModels.bingoModel.use_flash,
                    claimed = viewModel.claimed(),
                    index = $(element).index(),
                    show = ko.utils.unwrapObservable(valueAccessor());

                // set tween properties
                var tweenProps = show ? ((!bingodraw && !claimed) ? viewModel.getOnlyDayVisibleProps() : viewModel.getCardVisibleProps()) : viewModel.getInitProps();
                tweenProps.delay = index * .12;

                // animate element with tween properties
                if (!use_flash) {
                    TweenLite.to(element, .4, tweenProps);
                }
            }
        },

        /**
         * Binding handler for KoBingoCardModel which adds functionality for showing a single ball on a card when valueAccessor is true
         * This binding handler should be applied on a card ball
         * @scope: KoBingoCardModel
         * @example:
         *  <div class="ball" data-bind="visibleBall: true">2</div>
         */
        visibleBall: {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var value = ko.utils.unwrapObservable(valueAccessor);
                if (value() === true && !$(element).attr('data-ball-visible')) {

                    // get delay for animating ball
                    // get index of the last striked label, param viewModel is label
                    var delay = bindingContext.$parent.getLastStrikedLabelIndex(viewModel, $(element).parent().index());
                    setTimeout(function () {
                        $(element).attr('data-ball-visible', true);
                    }, delay * 100);
                }
            }
        },

        /**
         * Binding handler for KoBingoCardModel which adds functionality for showing the card asset `bingo` when valueAccessor is true
         * This binding handler should be applied on the card asset `bingo`
         * @scope: KoBingoCardModel
         * @example:
         *  <div data-bind="visibleBingo: true" class="bingo-asset"></div>
         */
        visibleBingo: {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var value = ko.utils.unwrapObservable(valueAccessor());
                if (value === true) {
                    setTimeout(function () {
                        $(element).addClass('active');
                    }, 500);
                } else {
                    $(element).removeClass('active');
                }
            }
        },

        /**
         * Binding handler which animates `price badge` elements when should be visible ('Verzilverd', 'Niet verzilverd', 'bingo')
         * @scope: $root
         * @example:
         *  <div class="not-claimed-badge" data-bind="visiblePricebadge: true">Niet verzilverd</div>
         */
        visiblePricebadge: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var visible = ko.utils.unwrapObservable(valueAccessor());

                // store its initial line-height, width, padding-left values
                var initial_properties = {
                    width: $(element).width(),
                    lineHeight: parseInt($(element).css('line-height')),
                    paddingLeft: parseInt($(element).css('padding-left'))
                };
                $(element).attr('data-initial-properties', ko.toJSON(initial_properties).replace(/\"/g, '\\"'));

                // when don't show price badge, set scale modus to 0
                if (visible === false) {
                    element.style.display = 'inline-block';
                    TweenLite.set(element, {
                        scaleX: 0,
                        scaleY: 0,
                        alpha: 0
                    });
                }
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var visible = ko.utils.unwrapObservable(valueAccessor()),
                    initialProps = JSON.parse($(element).attr('data-initial-properties').replace(/\\"/g, '"')),
                    tweenProps = (visible === true) ? {
                        delay: .3,
                        scaleX: 1,
                        scaleY: 1,
                        alpha: 1,
                        lineHeight: Math.abs(initialProps.lineHeight) + 'px',
                        paddingLeft: Math.abs(initialProps.paddingLeft) + 'px',
                        width: Math.abs(initialProps.width) + 'px',
                        ease: 'Back.easeOut'
                    } : {
                        scaleX: 0,
                        scaleY: 0,
                        alpha: 0,
                        paddingLeft: 0,
                        width: 0,
                        ease: 'Back.easeIn'
                    };
                TweenLite.to(element, .3, tweenProps);
            }
        },

        /**
         * Event window visibility change (switch window)
         * @example:
         *  data-bind="
         *      windowVisibilityChange: {
         *           hidden: function(){},
         *           visible: function(){}
         *       }
         *  "
         */
        windowVisibilityChange: {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var obj = ko.utils.unwrapObservable(valueAccessor()),
                    hiddenprop = Modernizr.prefixed('hidden', document, false);

                if ( hiddenprop ) {
                    $(document).on(hiddenprop.replace(/[H|h]idden/,'') + 'visibilitychange', function(e){
                        if ( document[hiddenprop] && _.has(obj, 'hidden') && _.isFunction(obj.hidden)){
                            obj.hidden();
                        }else if (!document[hiddenprop] && _.has(obj, 'visible') && _.isFunction(obj.visible)){
                            obj.visible();
                        }
                    });
                }
            }
        },

        /**
         * Event columnResizer
         * Attach matchMedia event for resizing columns
         * @uses jquery.columnresizer.js
         * @example: data-bind="columnResizer: {columns:1, exclude: $('a')}"
         */
        columnResizer: {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var obj = ko.utils.unwrapObservable(valueAccessor());
                $(element).columnresizer(obj.columns, obj.exclude);
            }
        },

        /**
         * When user clicked on this object copy content to clipboard
         * With support for all old browsers (flash fallback)
         * 
         * @uses jquery.clipboard.js
         * @example: data-bind="copyClipBoardByClick: document.getElementById('tellafriendbymail').innerHTML"
         */
        copyClipBoardByClick: {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel) { 
                var obj = ko.utils.unwrapObservable(valueAccessor());

                $(element).zclip({
                    path: window.app.model.paths.flash + 'ZeroClipboard.swf',
                    copy: obj.text,
                    afterCopy: function(){
                        alert(obj.message);
                    }
                });
            }
        },

        /**
         * Extending the click binging with touch for touch devices
         *
         * @param {HTMLElement} element
         * @param {object} valueAccessor
         * @return {void}
         */
        touchClick : {
            init: function(element, valueAccessor) {
                var callback = valueAccessor();

                $(element)
                    .on(Modernizr.touch ? 'touchstart' : 'click', function(event){
                        event.preventDefault();
                        callback(event);
                    });
            }
        },

        /**
         * Extending the original value binding
         * Add progress value functionality and dispatch it to the progress model
         * 
         * @param {HTMLElement} element
         * @param {object} valueAccessor
         * @param {object} allBindingsAccessor
         * @param {object} viewModel
         * @param {object} bindingContext
         * @return {object}
         */
        value : {
            init: originalValueBinding.init,
            update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var html5Support = (document.createElement('progress').max) && !Modernizr['ie10'],
                    call = valueAccessor();
                
                if ( element.tagName.toLowerCase() == 'progress' ){

                    // trigger progressUpdate event on the element
                    $(element).trigger('progressUpdate', [element, valueAccessor, allBindingsAccessor, viewModel, bindingContext]);

                    // update progress with jquery as fallback
                    if ( !html5Support && _.isFunction($.fn.progress) ) {

                        // if not set, first instantiate jquery.progress
                        if ( !$(element).data('progress') ){
                            $(element).progress();
                            $(element).data('progress', true);
                        }

                        // update progress value
                        $(element).progress('value', Math.round(call()));
                    }

                    // update progress value when valueAccessor isn't set
                    if ( _.has(viewModel, 'progressModel') && !_.isUndefined(call()) ){
                        viewModel.progressModel.progress( call() );
                    }
                }

                // dispatch it's original boundings
                originalValueBinding.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            }
        }
    });
})();
