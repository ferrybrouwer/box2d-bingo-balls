/*********************************************************************************
	 ____                                    _                 _           
	|  _ \ _ __ ___   __ _ _ __ ___  ___ ___| | ___   __ _  __| | ___ _ __ 
	| |_) | '__/ _ \ / _` | '__/ _ \/ __/ __| |/ _ \ / _` |/ _` |/ _ \ '__|
	|  __/| | | (_) | (_| | | |  __/\__ \__ \ | (_) | (_| | (_| |  __/ |   
	|_|   |_|  \___/ \__, |_|  \___||___/___/_|\___/ \__,_|\__,_|\___|_|   
	                 |___/                                                                                         

		@author Ferry Brouwer
		Progress ui (with IE fallback)

*********************************************************************************/

(function(){

	$.fn.progress = function( method ){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call(arguments, 1) );
		} else if ( typeof method === 'object' || !method ){
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.progress' );
		}  
	}

	/*********************************************************************************
		 ____        _     _ _                       _   _               _     
		|  _ \ _   _| |__ | (_) ___   _ __ ___   ___| |_| |__   ___   __| |___ 
		| |_) | | | | '_ \| | |/ __| | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
		|  __/| |_| | |_) | | | (__  | | | | | |  __/ |_| | | | (_) | (_| \__ \
		|_|    \__,_|_.__/|_|_|\___| |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/

	*********************************************************************************/

	var methods = {

		init : function( obj ){
			return this.each(function(){
				var $this = $(this), 
					support_html5_progress = (document.createElement('progress').max !== undefined) && !Modernizr['ie10'];

				// create progress ui
				if ( !support_html5_progress ){
					var $div = $('<div />'), $span = $('<span />');
					$div.append( $span );

					$div.addClass('fallback progress');
					$span.addClass('bar');
					
					$this.after( $div );
					$this.hide();

					$this.data('replacer', $div);
				}else{
					$this
						.attr('max', '100')
						.val(0);
				}
			});
		},

		/**
		 * Set value
		 * 
		 * @param {number} percentage
		 * @return {void}
		 */
		value : function( percentage ){
			return this.each(function(){
				var $this = $(this), 
					support_html5_progress = ( document.createElement('progress').max !== undefined ),
					$replacer = $this.data('replacer');

				if ( $replacer ){
					var $bar = $replacer.find('span.bar');
					$bar.css('width', percentage + '%');
				}else{
					$this.val( percentage );
				}
			});
		}
	}
})();