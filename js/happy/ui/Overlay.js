/*************************************************************************
	  ___                 _             
	 / _ \__   _____ _ __| | __ _ _   _ 
	| | | \ \ / / _ \ '__| |/ _` | | | |
	| |_| |\ V /  __/ |  | | (_| | |_| |
	 \___/  \_/ \___|_|  |_|\__,_|\__, |
	                              |___/ 
		
		@author Ferry Brouwer
		This class uses the following dependies:
			- Underscore.js
			- Modernizr.js
			- jQuery 1.4+

		In order to use this class, include the following SASS style:

			$prefixes : '-webkit-', '-moz-', '-ms-', '-o-', '';
			@mixin prefix-property( $property, $value ) {
				@each $prefix in $prefixes {
					#{$prefix}#{$property}: $value;
				}
			}

			html.overlay-ready #main,
			.overlay-background,
			.overlay-content {
				@include prefix-property('transform-origin', 50% 50%);
				@include prefix-property('transition-duration', 0.3s);
				@include prefix-property('transition-timing-function', cubic-bezier(0.250, 0.460, 0.450, 0.940));
				@each $prefix in $prefixes {
					#{$prefix}transition-property: opacity, #{$prefix}transform;
				}
			}
			html.overlay-active #main {
				@include transform( scale(0.9) );
			}
			.overlay-background {
				position: fixed;
				width: 100%;
				height: 100%;
				top: 0;
				left: 0;
				z-index: 999999;
				visibility: hidden;
				opacity: 0;
				background: rgba( 0, 0, 0, 0.5 );
			}
			.overlay-content {
				@include transform( scale(0.8) );
				position:absolute;
				z-index:9999999;
				visibility: hidden;
				opacity: 0;
				top:50%;
				left:50%;
			}
			html.overlay-active .overlay-content {
				@include transform( scale(1) );
				visibility: visible;
				opacity: 1;
			}
			html.overlay-active body > header,
			html.overlay-active body > footer,
			html.overlay-active #main {
				@include prefix-property('filter', blur(5px));
			}
			html.overlay-active .overlay-background {
				visibility: visible;
				opacity: 1;
			}

*************************************************************************/

(function($){
	var isOpen = false,
		csstransforms = Modernizr.csstransforms3d;


	function Overlay(){
		var self = this,
			background, 
			content,
			el;

		isOpen = false;

		// when is ie, don't use the csstransforms (pointer events problem)
		if ( window.navigator.userAgent.toLowerCase().indexOf('msie') !== -1 ) {
			csstransforms = false;
		}

		if ( csstransforms ) {
			$('html').addClass('overlay-ready');

			// add background
			self.background = $('<div />')
				.addClass('overlay-background')
				.prependTo('body');

			// add content
			self.content = $('<div />')
				.addClass('overlay-content')
				.prependTo('body');
		}else{
			self.backgroundColor = "#000000";
			self.speed = 500;
			self.alpha = .8;
		}

		// add close event
		$(document)
			.on(Modernizr.touch ? 'touchstart' : 'click', 'a.overlay-close', function(event){
				event.preventDefault();
				self.hide();
			});
	}

	Overlay.prototype = {

		/**
		 * Show popup
		 * 
		 * @public
		 * @param {html} el
		 * @param {function} callback
		 * @return {void}
		 */
		show : function( el, callback ){
			var self = this,
				offset = {
					top 	: ($(window).height()/2 + $(document).scrollTop()) - el.height()/2,
					left 	: $(window).width()/2 - el.width()/2
				},
				start_showing_overlay = function(){
					// show background
					if ( !self.background ){
						createBackground.call( self );
					}
					self.background
						.fadeTo( self.speed, self.alpha, 'swing' );
					
					// show content
					if ( !self.content ){
						createContent.call( self );
					}

					self.content
						.append( self.el.show() )
						.append( '<a href="#" class="button overlay-close"></a>' )
						.css({
							left 	: $(window).width()/2 - self.content.width()/2  + 'px',
							top 	: ($(window).height()/2 + $(document).scrollTop()) - self.content.height()/2 + 'px'
						})
						.fadeTo( self.speed, 1, 'swing', function(){
							$(this).removeAttr('filter');
							if ( _.isFunction(callback) ){
								callback();
							}
						});
				};

			isOpen = true;

			// clone object
			self.el = $(el).clone();
			self.el.get(0).style.display = 'block';

			if ( csstransforms ) {
				// set content, add close-button and position it to the middle
				$('.overlay-content')
					.html( self.el )
					.append( '<a href="#" class="button overlay-close"></a>' )
					.css({
						top 	: ($(window).height()/2 + $(document).scrollTop()) - $('.overlay-content').height()/2,
						left 	:  $(window).width()/2 - $('.overlay-content').width()/2
					});

				// show the popup!
				$('html').addClass('overlay-active');

				// invoke callback
				var transEndEventNames = {
				    'WebkitTransition' : 'webkitTransitionEnd',
				    'MozTransition'    : 'transitionend',
				    'OTransition'      : 'oTransitionEnd otransitionend',
				    'msTransition'     : 'MSTransitionEnd',
				    'transition'       : 'transitionend'
				}, transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

				$('.overlay-content')
					.on(transEndEventName, function(event){
						$(this).unbind(transEndEventName);
						if ( _.isFunction(callback) ){
							callback();
						}
					});
				
			}else{

				// show popup the old way for browsers that doesn't support csstransform animations
				// if popup content contains images, load the images first
				if ( self.el.find('img').length > 0 ){
					var arr = new Array();
					self.el.find('img').each(function(i, image){ arr.push( $(image).attr('src') ); });
					loadImages(arr, start_showing_overlay);
				}else{
					start_showing_overlay();
				}	
			}

			// attach click outside popup event
			attachClickOutsideEvent(function(){
				self.hide();
			});
		},

		/**
		 * Hide popup
		 * 
		 * @public
		 * @param {function} callback
		 * @return {void}
		 */
		hide : function( callback ){
			var self = this;

			isOpen = false;
			
			if ( !_.isUndefined(self.el) ){

				if ( csstransforms ) {
					$('html').removeClass('overlay-active');

					var transEndEventNames = {
					    'WebkitTransition' : 'webkitTransitionEnd',
					    'MozTransition'    : 'transitionend',
					    'OTransition'      : 'oTransitionEnd otransitionend',
					    'msTransition'     : 'MSTransitionEnd',
					    'transition'       : 'transitionend'
					}, transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

					$('.overlay-content')
						.on(transEndEventName, function(event){
							$(this).unbind(transEndEventName);
							self.el.remove();
							if ( _.isFunction(callback) ){
								callback();
							}
						});
				}else{

					self.content
						.fadeOut(self.speed, 'swing');

					self.background
						.fadeOut(self.speed, 'swing', function(){
							$('#lightbox-content').remove();
							$('#lightbox-background').remove();
							self.background = self.content = null;
							if ( _.isFunction(callback) ){
								callback();
							}
						});
				}

			}
		},

		/**
		 * Check if popup is open
		 * 
		 * @return {boolean}
		 */
		isOpen : function(){
			return isOpen;
		}
	};

	/**
	 * Attach click outside popup event
	 * When clicked, detach event and invoke callback function
	 * @param {function} callback
	 * @return {void}
	 */
	function attachClickOutsideEvent( callback ) {
		var $backgroundElement = csstransforms ? $('html.overlay-active .overlay-background') : $('#lightbox-background');
		$backgroundElement
			.on(Modernizr.touch ? 'touchstart' : 'click', function(event){
				$backgroundElement.off(Modernizr.touch ? 'touchstart' : 'click');
				if ( _.isFunction(callback) ){
					callback();
				}
			});
	}

	/**
	 * Create background
	 * For browsers that doesn't support the csstransform generate the background
	 * 
	 * @private
	 * @this {Overlay}
	 * @return {void}
	 */
	function createBackground(){
		this.background = $('<div />')
			.attr('id', 'lightbox-background')
			.css({
				'background-color' 	: this.backgroundColor,
				'position'			: 'fixed',
				'width'				: '100%',
				'height'			: '100%',
				'z-index'			: '999999',
				'top'				: '0',
				'left'				: '0',
				'display'			: 'none'
			})
			.prependTo('body');
	}

	/**
	 * Create content
	 * For browsers that doesn't support the csstransform create the content
	 *
	 * @private
	 * @this {Overlay}
	 * @return {void}
	 */
	function createContent(){
		this.content = $('<div />')
			.attr('id', 'lightbox-content')
			.css({
				'position'		: 'absolute',
				'z-index'		: '9999999',
				'-moz-opacity'	: '0',
				'filter'		: 'alpha(opacity=0)',
				'opacity'		: 0
			});
			
		this.background.after( this.content );
	}

	/**
	 * Load images
	 *
	 * @private
	 * @param {array} arr
	 * @param {function} callback
	 * @return void
	 */
	function loadImages( arr, callback ){
		var loadCounter = 0;
		var aImages = new Array();
		jQuery.each( arr, function(i, image){
			jQuery('<img />').load(function(data){
				aImages.push(data.currentTarget);
				loadCounter++;
				if (loadCounter == arr.length){
					if ( String(typeof(callback)).toUpperCase() == 'FUNCTION' ){
						aImages.sort(function sortArrayBySource(a, b){
							var a_src = jQuery(a).attr('src').toUpperCase();
							var b_src = jQuery(b).attr('src').toUpperCase();
							return (a_src < b_src) ? -1 : (a_src > b_src) ? 1 : 0;
						});
						callback(aImages);
					}
				}
			})
			.attr('src', image);
		});
	}

	window.Overlay = Overlay;
})(jQuery);

