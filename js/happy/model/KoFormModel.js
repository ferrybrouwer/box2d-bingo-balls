/**
 * Form Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 */
(function($, models, classes){
    'use strict';

	var popup_conversion_template;

	// when DOM is loaded, assign template vars
	$(document).ready(function(event){
		popup_conversion_template =  _.template(document.getElementById('popup_conversion').innerHTML);
	});

	// add Knockout binding 'updateComplexity' to passwords input elements
	_.extend(ko.bindingHandlers, {
		updateComplexity : {
		    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
				var html5Support = document.createElement('progress').max !== undefined,
				    func = valueAccessor();

				// apply complexity plugin which sets the complexity observable
		       	if ( _.has(element, 'type') && element.type == 'password' ){
			        $(element)
				        .complexify({
				        	minimumChars : 6, 
				        	strengthScaleFactor : 0.5
				        }, function (valid, complexity){
				        	func(complexity);
						});
		       	}
		    }
		}
	});

	/**
	 * Form Knockout Model
	 * Handle form submit's with ajax calls
	 * @return {KoFormModel}
	 */
	function KoFormModel(){
		var self = this;
		self.passwordComplexity = ko.observable(0);
		self.passwordComplexityText = ko.computed(function(){
			var states = ['Erg slecht', 'Slecht', 'Gemiddeld', 'Goed', 'Erg goed'];
			var index = Math.round(states.length/100 * self.passwordComplexity()) - 1;
			if ( _.isNaN(index) || index == -1 ){
				index = 0;
			}
			return states[index];
		});

		// bind ajax submits on every form element which are not attached to knockout
		// this will prevent submitting the form by a page refresh
		$(document)
			.on('submit', 'form[method="post"]:not([data-bind]), form[method="POST"]:not([data-bind])', function(event){
				event.preventDefault();
				defaultAjaxSubmit.call(this);
			});

		/**
		 * Forgot Password
		 * Show conversion page when e-mailaddress is provided
		 * @param  {HTML form element} form
		 * @return {void}
		 */
		self.forgotPassword = function( form ) {
			defaultAjaxSubmit.call(form, function(result){
				if ( result.success ){
					$(form).parents('.popup_forgot_password')
						.html(
							popup_conversion_template({
								title 	: 	'Inlog-gegevens vergeten',
								content	: 	'Je ontvangt een e-mail van ons waarmee \
											je een nieuw wachtwoord kunt opgeven. Zodra je \
											het wachtwoord hebt veranderd, ontvang je een \
											tweede e-mail met daarin je inlognaam en het \
											nieuwe wachtwoord.'
							})
						);
				}
			});
		}

		/**
		 * User details changed
		 * Show conversion page after succesfully submitted update of details
		 * @param  {HTML form element} form
		 * @return {void}
		 */
		self.changeDetails = function( form ) {
			defaultAjaxSubmit.call(form, function(result){
				if ( result.success ){
					
                    // open popup conversion,
                    // this creates an popup with class .popup-content.popup_conversion
                    models.popupModel.openPopup('popup_conversion');

                    // Disable any active error messages
                    $('.error-message').hide();
                    $(form).find('.error').removeClass('error');

                    // change content popup to conversion text
                    $('.popup-content.popup_conversion').html(
                        popup_conversion_template({
                            title   :   'Gelukt!',
                            content :   'Vul je deze gegevens voor de eerste keer in? Let dan op: het kan het even duren voordat de bingopunten in je saldo-overzicht zichtbaar zijn.'
                        })
                    );
				}
			});
		}

		/**
		 * Forgot Password
		 * Show conversion page when e-mailaddress is provided
		 * @param  {HTML form element} form
		 * @return {void}
		 */
		self.changePassword = function( form ) {
			defaultAjaxSubmit.call(form, function(result){
				if ( result.success ){
					$(form).parents('.popup_changepassword')
						.html(
							popup_conversion_template({
								title 	: 	'Wachtwoord veranderd',
								content	: 	'Je wachtwoord is succesvol veranderd, vanaf nu kun je met je nieuwe wachtwoord inloggen.'
							})
						);
				}
			});
		}

		/**
		 * Change bank account details
		 * @param  {HTML form element} form
		 * @return {void}
		 */
		self.changeBankAccount = function( form ) {
			defaultAjaxSubmit.call(form, function(result){
				if ( result.success ){
					$(form).parents('.popup_bank_details_edit')
						.html(
							popup_conversion_template({
								title 	: 	'Bankgegevens veranderd',
								content	: 	'Je gegevens zijn succesvol veranderd.'
							})
						);

                    // update user model
                    _.each($(form).serializeArray(), function(obj){
                        if ( _.has(models.userModel, obj.name) ) {
                            models.userModel[obj.name](obj.value);
                        }
                    });
				}
			});
		}

        /**
         * Request payment
         * Update user- and payment request model after successfully request payment
         * @param  {HTML form element} form
         * @return {void}
         */
        self.requestPayment = function( form ) {
            defaultAjaxSubmit.call(form, function(result){
                if ( result.success ){
                    $(form).parents('.popup_payment_request')
                        .html(
                            popup_conversion_template({
                                title   :   'Gefeliciteerd!',
                                content :   'Uw betaling is succesvol aangevraagd.'
                            })
                        );

                    // update user balance
                    var balance = parseInt(models.userModel.balance()) - models.paymentRequestModel.points();
                    models.userModel.balance(balance);

                    // update points remaining in payment request model
                    models.paymentRequestModel.maxPoints(balance);
                    models.paymentRequestModel.points(balance);
                }
            });
        }

		/**
		 * GET ajax call
		 * @param  {string} action
		 * @return {void}
		 */
		self.get = function( action ) {
			$.get(action, function(result){
				if (!_.isUndefined(console) && _.isFunction(console)){
					console.log(result);
				}
			})
			.fail(function(jqXHR, textStatus, errorMessage){
				if (!_.isUndefined(console) && _.isFunction(console)){
					console.log(errorMessage);
				}
			});
		}
	}
	
	/**
	 * Default ajax submit
	 * @this {form}
	 * @param {function} callback
	 * @return {void}
	 */
	function defaultAjaxSubmit( callback ){
		var $form = $(this),
			$error = $form.find('.error-message'),
			$required_inputs = $form.find('input[required]'),
			$clickableElements = $form.find('button, input[type="submit"], a');

		$form.loader('show');
		$clickableElements.prop('disabled', true).addClass('disabled');

		$.post($form.attr('action'), $form.serializeArray())
			.done(function(result){
				result = $.parseJSON(result);
				$form.loader('hide');

                // if track event is provided
                // call track event
                var trackevent = _.isObject(result.trackEvent) ? result.trackEvent : null;
                if ( trackevent && !_.isEmpty(trackevent.category) && !_.isEmpty(trackevent.action) ) {
                    models.trackEvent.add(trackevent.category, trackevent.action, !_.isEmpty(trackevent.label) ? trackevent.label : null);
                }

				if ( result.success ){
					$error.slideUp();
					$required_inputs.removeClass('error');

					if ( _(result.data).isUrl() ){
						window.location = result.data;
						return;
					}

					$clickableElements.prop('disabled', false).removeClass('disabled');
				}else{
					if ( !_.isEmpty(result.errorMessage) ){
						$error.text(result.errorMessage).slideDown();
					}
					if ( !_.isEmpty(result.data) ){
						showFieldErrors.call( $form, result.data );
					}
					if ( _.isEmpty(result) ){
						$required_inputs.addClass('error');
					}
					$clickableElements.prop('disabled', false).removeClass('disabled');
				}

				if ( _.isFunction(callback) ){
					callback(result);
				}
			})
			.fail(function(jqXHR, textStatus, errorMessage){
				$form.loader('hide');
				$error.text(errorMessage).slideDown();
				$required_inputs.addClass('error');

				$clickableElements
					.prop('disabled', false)
					.removeClass('disabled');

				if ( _.isFunction(callback) ){
					callback();
				}
			});
	}

	/**
	 * Show errors on fields by given fields array
	 *
	 * @this {$form}
	 * @param {arrray} fields
	 * @return {void}
	 */
	function showFieldErrors( fields ){
		_.each(this.find('input, textarea'), function(el){
			var $el = $(el);
			if ( _.indexOf(fields, el.name) !== -1 ){
				$el.addClass('error');
			}else{
				$el.removeClass('error');
			}
		});
	}

	/**
	 * Check if given string is an url
	 * Extension to underscore.js
	 * 
	 * @param  {string}  str [string to check if it's an url]
	 * @return {Boolean}
	 */
	_.mixin({
		isUrl : function(str) {
			var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
			'(\\#[-a-z\\d_]*)?$','i');

			return pattern.test(str);
		}
	});


    // assign bingo card model class
    classes.FormModel = KoFormModel;

})(jQuery, app.model.koModels, app.model.koClasses);
