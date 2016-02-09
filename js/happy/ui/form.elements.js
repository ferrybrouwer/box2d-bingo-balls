(function($){
    'use strict';

	/**
	 * Set default values for input text elements which has the attribute placeholder
	 * Empty inputs on submit form when value is the placeholder
	 * Only for browsers that doesn't support the attribute placeholder
	 */
	if ( !Modernizr.input.placeholder ){
		// live events on inputs with placeholder attribute
		$(document)
			.on('focus', 'input[placeholder]:not(:password), textarea[placeholder]', function(event){
				var $input = $(this);
				if ( $.trim($input.val()) === $input.attr('placeholder') ){
					$input.val('');
					setNormalStyle( $input );
				}
			})
			.on('blur', 'input[placeholder]:not(:password), textarea[placeholder]', function(event){
				var $input = $(this);
				if ( $.trim($input.val()) == '' ){
					$input.val( $input.attr('placeholder') );
					setPlaceholderStyle( $input );
				}
			})
			.on('submit', 'form', function(event){
				var $form = $(this);
				$form.find('input[placeholder]:not(:password), textarea[placeholder]').each(function(i, input){
					$input = $(input);
					if ( $.trim($input.val()) === $input.attr('placeholder') ){
						$input.val('');
						setNormalStyle( $input );
					}
				});
			});

		// set default start values
		$('input[placeholder]:not(:password), textarea[placeholder]').each(function(i, input){
			var $input = $(input);
			if ( $.trim($input.val()) === '' ){
				$input.val( $input.attr('placeholder') );
				setPlaceholderStyle( $input );
			}
		});
	}

	/**
	 * Set placeholder values
	 * For browsers that doesn't support placeholder on input elements
	 */
	function setPlaceholder(){
		if ( !Modernizr.input.placeholder ){
			$('input[placeholder]:not(:password), textarea[placeholder]').each(function(i, input){
				var $input = $(input);
				if ( $.trim($input.val()) === '' ){
					$input.val( $input.attr('placeholder') );
					setPlaceholderStyle( $input );
				}
			});
		}
	}

	/**
	 * Set placeholder css styles
	 * 
	 * @param {element} $input
	 * @return {void}
	 */
	function setPlaceholderStyle( $input ){
		$('input[placeholder]:not(:password), textarea[placeholder]')
			.css({
				'font-style' 	: 'italic',
				'color' 		: '#ccc'
			});
	}

	/**
	 * Set placeholder default styles
	 *
	 * @param {element} $input
	 * @return {void}
	 */
	function setNormalStyle( $input ){
		$('input[placeholder]:not(:password), textarea[placeholder]')
			.css({
				'font-style' 	: '',
				'color' 		: ''
			});
	}		

	window.app.ui.setPlaceholder = setPlaceholder;
})(jQuery);