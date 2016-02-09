(function() {
	"use strict";


	/**
	 * Column resizer
	 *
	 * @param {number} number_of_columns
	 * @param {array} $exclude_articles
	 * @param {Function} callback (optionally)
	 *
	 * @return {jQuery}
	 */
	$.fn.columnresizer = function(number_of_columns, $exclude_articles) {
		if (_.isNumber(number_of_columns)) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('First parameter of jQuery.columnresizer must be a number');
		}
	};

	var methods = {
		init: function(columns_per_row, $exclude_articles, callback) {
			return this.each(function() {

				var images_to_load = [],
					setHeights = function() {
						var $children = _.compact($(this).children()),
							$exclude = !_.isUndefined($exclude_articles) ? _.compact($exclude_articles) : [],
							rows = [];

						// reset children (extract the articles to exclude)
						$children = _.difference($children, $exclude);

						// fill rows array with heights of children
						_.each($children, function(child) {

							var rowIndex = Math.floor(_.indexOf($children, child) / columns_per_row),
								columnIndex = _.indexOf($children, child) % columns_per_row,
								rowObj = _.isUndefined(rows[rowIndex]) ? rows[rowIndex] = { height: 0, children: [] } : rows[rowIndex];

							// first add to children
							rowObj.children.push(child);

							// now compare height and set max
							var childHeight = $(child).outerHeight();
							if (childHeight > rowObj.height) {
								rowObj.height = childHeight;
							}
						});

						// walk over rows and apply height of all children
						_.each(rows, function(row) {
							_.each(row.children, function(child) {
								$(child).css('height', row.height + 'px');
							});
						});
					};


				// collect image sources to load
				_.each($(this).find('img'), function(img) {
					images_to_load.push(img.src);
				});

				if (images_to_load.length > 0) {
					loadImages.call(this, images_to_load, _.bind(setHeights, this));
				} else {
					setHeights.call(this);
				}
			});
		}
	};


	function loadImages(arr, callback) {
		var loadCounter = 0;
		var aImages = new Array();
		$.each(arr, function(i, image) {
			$('<img />').load(function(data) {
				aImages.push(data.currentTarget);
				loadCounter++;
				if (loadCounter == arr.length) {
					if (String(typeof(callback)).toUpperCase() == 'FUNCTION') {
						aImages.sort(function sortArrayBySource(a, b) {
							var a_src = $(a).attr('src').toUpperCase();
							var b_src = $(b).attr('src').toUpperCase();
							return (a_src < b_src) ? -1 : (a_src > b_src) ? 1 : 0;
						});
						callback(aImages);
					}
				}
			}).attr('src', image);
		});
	}

})();
