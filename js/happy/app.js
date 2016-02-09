(function($, models, classes){

	// initialize addthis only if device isn't mobile
	// if it's not, delay addthis, prevent long page load and conflict other javascripts
	if ( !_.has(window.app.model, 'isMobile') || !window.app.model.isMobile ){
//		setTimeout(function() {
//			addthis.init();
//		}, 3000);
	}

    // create instances of knockout classes and assign them to the models property
    var excludeFromModels = ['BingoFlashModel', 'KoBingoCardModel'];
    for (var _className in classes) {
        if (_.indexOf(excludeFromModels, _className) === -1) {
            var _Class = classes.hasOwnProperty(_className) ? classes[_className] : null;
            _className = _className[0].toLowerCase() + _className.replace(/^[\w]?/, '');
            models[_className] = new _Class();
        }
    }

    // apply knockout binding
    if (!_.isEmpty(models)) {
        ko.applyBindings(models);
        $(document).trigger('knockoutReady');
    }

})(jQuery, app.model.koModels, app.model.koClasses);