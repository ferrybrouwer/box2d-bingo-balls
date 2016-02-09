(function($){

	/**
	 * Animate sprite loader
	 * Uses the util/requestanimatedframe.js
	 * 
	 * @this {SpriteLoader}
	 * @return {void}
	 */
	function animate(){
		var self = this;
		self.requestID = window.requestAnimationFrame( animate.bind(self) );

		var new_background_position = (self.current_left_position - self.loaderImageObj.width <= -(self.loaderImageObj.width * self.loaderImageObj.numberofsprites)) ? 0 : self.current_left_position - self.loaderImageObj.width;
		self.loader_asset.css('background-position', new_background_position + 'px 0px');
		self.current_left_position = new_background_position;
	}

	/**
	 * Loader class
	 * Uses the jQuery- and TweenLite library
	 * Generates a loader object
	 * Animating with background position from spritesheet
	 *
	 * @author 					: Ferry Brouwer
	 * @param htmlElement 		: HTML element (where to append the loader)
	 * @param loaderImageObj 	: Object of the loader image {path, width, height}
	 */
	function SpriteLoader( htmlElement, loaderImageObj ){
		var self = this;
		this.htmlElement = htmlElement, 
		this.loaderImageObj = loaderImageObj, 
		this.element, 
		this.loader_wrapper, 
		this.loader_container, 
		this.loader_asset,
		this.requestID;

		this.initialize();
	}

	SpriteLoader.prototype = {
		constructor : SpriteLoader,

		/**
		 * Initialize the sprite loader
		 * 
		 * @private
		 * @return void
		 */
		initialize : function(){
			var self = this;

			// set the element where to append the loader
			self.element = $(self.htmlElement);

			// create the loader wrapper containing loader_container and loader_div
			self.loader_wrapper = $('<div />')
				.addClass('loader-wrapper')
				.css({	
					'width'						: '200px',
					'height'					: '110px',
					'position'					: 'absolute',
					'z-index'					: 999,
					'top'						: '50%',
					'left' 						: '50%',
					'margin-left'				: '-100px',
					'margin-top' 				: '-37px',
					'overflow'					: 'hidden',
					'-webkit-box-shadow' 		: 'rgba(0, 0, -1, 0.2) 1px 1px 20px',
					'-moz-box-shadow' 			: 'rgba(0, 0, -1, 0.2) 1px 1px 20px',
					'box-shadow' 				: 'rgba(0, 0, -1, 0.2) 1px 1px 20px',
					'-webkit-border-radius'		: '2px',
					'-moz-border-radius'		: '2px',
					'border-radius'				: '2px',
					'text-align'				: 'center'
				})
				.prependTo(self.element);

			// enable GPU rendering
			var loader_wrapper_element = self.loader_wrapper.get(0);
			loader_wrapper_element.style[Modernizr.prefixed('backfaceVisibility')] = 'hidden';
			loader_wrapper_element.style[Modernizr.prefixed('perspective')] =  400;
			loader_wrapper_element.style[Modernizr.prefixed('transformStyle')] = 'preserve-3d';

			// create loader container containing the loader_div
			self.loader_container = $('<div />')
				.addClass('loader-container')
				.css({
					'width'				: '200px',
					'height'			: '110px',
					'position'			: 'relative',
					'background-color' 	: '#fff',
					'z-index'			: 999,
					'top'				: 0,
					'filter' 			: 'alpha(opacity=95)',
					'-moz-opacity' 		: '0.95',
					'-khtml-opacity' 	: '0.95',
					'opacity' 			: '0.95',
					'padding-top' 		: '10px'
				})
				.html('Bezig met verwerken<br>Een ogenblik geduld a.u.b...')
				.prependTo(self.loader_wrapper);

			// create the loader div
			self.loader_asset = $('<div />')
				.addClass('loader-asset')
				.css({
					'background' 	: 'url("' + self.loaderImageObj.path + '") no-repeat left top',
					'width'				: self.loaderImageObj.width + 'px',
					'height'			: self.loaderImageObj.height + 'px',
					'position'			: 'absolute',
					'bottom'			: '30px',
					'left'				: '50%',
					'margin-left'		: -self.loaderImageObj.width/2 + 'px'
				})
				.prependTo(self.loader_container);

			// show loader directly!
			if ( typeof self.loaderImageObj.autoShow === 'undefined' ){
				self.loaderImageObj.autoShow = true;
			}
			if (self.loaderImageObj.autoShow) self.show();
		},

		/**
		 * Show loader
		 *
		 * @public
		 * @return void 
		 */
		show : function(){
			// store timestamp
			this.timestamp = _.isFunction(Date.now) ? Date.now() : (new Date()).getTime();

			// show loader wrapper
			TweenLite.set(this.loader_wrapper, {y:50, alpha:0, display:'block'});
			TweenLite.to(this.loader_wrapper, 1, {y:0, alpha:1, ease:'Back.easeOut'});

			// reset spriteloader position
			this.current_left_position = 0;

			// call animation
			animate.call(this);
		},

		/**
		 * Hide loader
		 * 
		 * @public 
		 * @param callback : Function
		 * @return void
		 */
		hide : function( callback ){
			var self = this;

			var hide_timestamp = _.isFunction(Date.now) ? Date.now() : (new Date()).getTime(),
				diff_time = hide_timestamp - self.timestamp,
				animateOut = function(){

					// remove frame update
					if ( _.isNumber(self.requestID) ){
						window.cancelAnimationFrame(self.requestID);
					}

					// hide loader wrapper
					TweenLite.to(self.loader_wrapper, 1, {y:-50, alpha:0, ease:'Back.easeInOut', onComplete:function(){
						self.loader_wrapper.remove();
						if ( _.isFunction(callback) ){
							callback();
						}
					}});
				};

			// if time between show and hide is smaller than 1s, whait until it's 1s 
			var timeout_duration = (diff_time < 600) ? 600 - diff_time : 0;
			setTimeout(animateOut, 600 - diff_time);

			// reset timestamp
			self.timestamp = null;
		},

		/**
		 * Remove the loader object
		 *
		 * @public
		 * @param callback : Function
		 * @return void
		 */
		remove : function( callback ){
			var self = this;
			TweenLite.to(self.loader_asset, .6, {css:{autoAlpha:0}, onComplete:function(){
				if (self.timer) clearInterval(self.timer);
				self.loader_wrapper.remove();
				if ( callback != null ) callback();
			}});
		}
	};

	var methods = {

		/**
		 * Show cactus loader overlay
		 * 
		 * @public 
		 * @return {jQuery Object}
		 */
		show : function(){
			return this.each(function(){
				var $this = $(this), data = $this.data('loader');

				// set data
				if ( !data ){
					$(this).css('position', 'relative');
					
					// create sprite loader
					var spriteLoader = new SpriteLoader($this, {
						path 			: window.app.model.paths.images +  'loader.png',
						width 			: 32,
						height 			: 32,
						numberofsprites	: 18,
						autoShow 		: false
					})

					$this.data('loader', {'spriteLoader'	: spriteLoader});
					data = $this.data('loader');
				}

				data.spriteLoader.show();
			});
		},

		/**
		 * Hide cactus loader overlay
		 *
		 * @public
		 * @param {function} callback [optional]
		 * @return {jQuery Object}
		 */
		hide : function( callback ){
			return this.each(function(){
				var $this = $(this), 
					data = $this.data('loader');

				if ( data ){
					data.spriteLoader.hide(function(){
						$this.data('loader', null);

						if ( _.isFunction(callback) ){
							callback();
						}
					});
				}
			});
		}
	}

	/**
	 * Generate cactus loader jQuery Object
	 *
	 * @param {string} method
	 * @return {jQuery Object}
	 */
	$.fn.loader = function( method ){
		if ( methods[method] ) {
	      	return methods[method].apply( this, Array.prototype.slice.call(arguments, 1) );
	    } else {
	      	$.error( 'Method ' +  method + ' does not exist on jQuery.loader' );
	    }  
	}
})(jQuery);
