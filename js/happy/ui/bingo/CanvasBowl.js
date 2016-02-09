/*
      _____                            ____                _ 
     / ____|                          |  _ \              | |
    | |     __ _ _ ____   ____ _ ___  | |_) | _____      _| |
    | |    / _` | '_ \ \ / / _` / __| |  _ < / _ \ \ /\ / / |
    | |___| (_| | | | \ V / (_| \__ \ | |_) | (_) \ V  V /| |
     \_____\__,_|_| |_|\_/ \__,_|___/ |____/ \___/ \_/\_/ |_|

     @author: Ferry Brouwer
     Canvas Bowl Class
     Draw a curved bowl on the canvas element
     
     Dependency : 
        - EaselJS http://www.createjs.com/#!/EaselJS
        - Underscore http://underscorejs.org
        - jQuery http://jquery.com
        - TweenLite http://www.greensock.com/tweenlite/
 */
(function() {
    window.app.ui = window.app.ui || {};
    window.app.ui.bingo = window.app.ui.bingo || {};
    window.app.ui.bingo.CanvasBowl = CanvasBowl;

    var $window = $(window),
        timer,
        animFrame,
        defaultProps = {
            width: 0,
            height: 0
        };

    function CanvasBowl(canvas) {
        this.canvas = canvas;
        this.width($(window).width());
        if (this.width() < 980) {
            this.width(980);
        }
        this.height(139);

        // create stage and props
        this.stage = new createjs.Stage(this.canvas);
        this.props = {
            grey: new createjs.Shape(),
            white: new createjs.Shape()
        }
        this.stage.addChild(this.props.grey);
        this.stage.addChild(this.props.white);

        // add shadow to props.grey
        this.props.grey.shadow = new createjs.Shadow(createjs.Graphics.getRGB(0, 0, 0, .1), 0, -5, 5);

        // on init hide the ground
        TweenLite.set(this.canvas, {
            scaleY: 0,
            transformOrigin: '0 100%'
        });
    }

    _.extend(CanvasBowl.prototype, {

        /**
         * Draw on canvas
         * @param {boolean} loop
         * @return {void}
         */
        _draw: function(loop) {
            // draw curve again
            this.props.grey.graphics
                .clear()
                .beginFill('#f4f4f4')
                .moveTo(0, 15)
                .quadraticCurveTo(this.width() / 2, this.height() + 22, this.width(), 15)
                .lineTo(this.width(), 63)
                .quadraticCurveTo(this.width() / 2, this.height() + 68, 0, 63)
                .closePath();

            // draw props.white shape above the props.grey shape
            this.props.white.graphics
                .clear()
                .beginFill('#fff')
                .moveTo(0, 62)
                .quadraticCurveTo(this.width() / 2, this.height() + 68, this.width(), 62)
                .lineTo(this.width(), this.height())
                .lineTo(0, this.height())
                .closePath();

            // update stage
            this.stage.update();

            // if loop is provided, start looping
            if (loop) {
                this.animFrame = window.requestAnimFrame(this._draw.bind(this));
            }
        },

        /**
         * Resize canvas bowl
         * @return {void}
         */
        resize: function() {
            var self = this;

            self.width($window.width());
            if (self.width() < 980) {
                self.width(980);
            }
            self._draw();

            if (!_.isUndefined(timer)) {
                timer = clearTimeout(timer);
            }

            // request animframe update, 
            // delete request animated frame after 100ms (stopped resizing)
            timer = setTimeout(function() {
                timer = clearTimeout(timer);
                window.cancelAnimFrame(self.animFrame);
            }, 100);
        },

        /**
         * Show canvas bowl
         * Animate grey bowl in
         * @return {void}
         */
        show: function() {
            this._draw(false);
            TweenLite.to(this.canvas, 1.4, {
                scaleY: 1,
                ease: 'Elastic.easeInOut'
            });
        },

        /**
         * Hide canvas bowl
         * Animate grey bowl out
         * @return {void}
         */
        hide: function() {
            TweenLite.to(this.canvas, 1.4, {
                scaleY: 0,
                ease: 'Elastic.easeInOut'
            });
        },

        /**
         * Getter / Setter width of canvas
         * @param  {int} value
         * @return {int}
         */
        width: function(value) {
            if (!_.isUndefined(value)) {
                defaultProps.width = value;
                this.canvas.setAttribute('width', value);
            }
            return defaultProps.width;
        },

        /**
         * Getter / Setter height of canvas
         * @param  {int} value
         * @return {int}
         */
        height: function(value) {
            if (!_.isUndefined(value)) {
                defaultProps.height = value;
                this.canvas.setAttribute('height', value);
            }
            return defaultProps.height;
        }
    });
})();