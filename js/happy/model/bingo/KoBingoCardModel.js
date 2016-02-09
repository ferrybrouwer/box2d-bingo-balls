/**
 * Bingo Card Knockout Model
 *
 * @param {object} models   [contains class instances]
 * @param {object} classes  [contains classes]
 */
(function (models, classes) {
    var supportBox2d = Modernizr.csstransforms3d && Modernizr.canvas && (window.navigator.userAgent.toLowerCase().indexOf('msie') === -1);

    function KoBingoCardModel(data) {
        var self = this;

        // static variables
        self.showLabels = false;

        // observables
        self.striked = ko.observableArray();
        self.bingo = ko.observable(false);
        self.pointsLastLabel = ko.observable(0).extend({
            notify: 'always'
        });

        // bind properties
        _.each(data, function (value, key) {
            self[key] = (key === 'claimed' || key === 'color' || key == 'disabled') ? ko.observable(value) : value;
        });

        // auto bind scope
        this._autoBind();
    }

    KoBingoCardModel.prototype = {
        constructor: KoBingoCardModel,

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
         * Strike ball
         * @param {string} label
         * @param {string} color
         * @return {void}
         */
        strikeBall: function (label, color) {
            var self = this,
                strikedLabels = _.pluck(self.striked(), 'label'),
                points = 0;

            // strike only if label isn't in the striked labels
            // strike only if label is found in given labels array
            if (_.indexOf(strikedLabels, label) === -1 && _.indexOf(self.labels, label) !== -1) {
                self.striked.push({
                    label: label,
                    color: color
                });

                // check if all labels are striked on claimed but not disabled card, 
                // then show bingo after delay of 300ms!
                strikedLabels = _.pluck(self.striked(), 'label');
                var labelsRemain = _.difference(_.uniq(self.labels), strikedLabels);
                if (labelsRemain.length === 0 && self.claimed() && !self.disabled()) {
                    self.bingo(true);
                }

                // update points last label when card is claimed and card isn't disabled
                if (self.claimed() && !self.disabled()) {
                    var hitsOnCards = 0;
                    for (var i = 0; i < self.labels.length; i++) {
                        if (self.labels[i] === label) {
                            hitsOnCards++;
                        }
                    }
                    points = hitsOnCards * window.app.model.settings.points_per_ball;
                }
            }

            self.pointsLastLabel(points);
        },

        /**
         * Get label color
         * @param  {string} label
         * @return {string}
         */
        getLabelColor: function (label) {
            var self = this,
                arr = _.select(self.striked(), function (obj) {
                    return obj.label === label;
                });
            return (arr.length > 0) ? arr[0].color : '#cecece';
        },

        /**
         * Check if given label has striked
         * @param  {string} label
         * @return {boolean}
         */
        isStrikedLabel: function (label) {
            var self = this;
            return _.indexOf(_.pluck(self.striked(), 'label'), label) !== -1;
        },

        /**
         * Get initialize properties
         * Used for TweenLite properties
         * @return {object}
         */
        getInitProps: function () {
            var self = this,
                index = _.indexOf(models.bingoModel.cards(), self),
                totalCards = models.bingoModel.cards().length,
                props = {
                    x: function () {
                        var margin = 12,
                            card_width = 187 + margin,
                            middle_x = window.innerWidth / 2 - card_width / 2,
                            offset_x = middle_x - (Math.floor(totalCards / 2) * card_width);
                        return Math.round(offset_x + (index * card_width));
                    },
                    transformOrigin: function () {
                        var transform_origin_x = 100 - index * (100 / (totalCards - 1));
                        return transform_origin_x + '% 0%';
                    }
                };
            return {
                transformOrigin: props.transformOrigin(),
                x: props.x(),
                y: 300,
                visibility: 'visible',
                scaleY: 0,
                scaleX: 0
            };
        },

        /**
         * Get properties when card must be visible
         * Used for TweenLite properties
         * @return {object}
         */
        getCardVisibleProps: function () {
            var self = this,
                index = _.indexOf(models.bingoModel.cards(), self),
                totalCards = models.bingoModel.cards().length,
                props = {
                    rotation: function () {
                        var rotation_step = 3,
                            start_rotation = -(Math.floor(totalCards / 2) * rotation_step);
                        return Math.round(start_rotation + (index * rotation_step));
                    },
                    y: function () {
                        var y_step = Math.pow(Math.abs(index - Math.floor(totalCards / 2)), 2.3);
                        return 15 + (y_step * 2);
                    }
                };
            return {
                rotation: props.rotation(),
                y: props.y(),
                scaleY: 1,
                scaleX: 1,
                ease: 'Back.easeOut',
                delay: index * .12
            };
        },

        /**
         * Get properties of card when only the day must be visible
         * Used for TweenLite properties
         * @return {object}
         */
        getOnlyDayVisibleProps: function () {
            var self = this,
                props = self.getCardVisibleProps(),
                index = _.indexOf(models.bingoModel.cards(), self),
                totalCards =models.bingoModel.cards().length,
                y_step = Math.pow(Math.abs(index - Math.floor(totalCards / 2)), 2.3);
            props.y += 240 - (y_step * 5);
            return props;
        },

        /**
         * Get last striked label index
         *
         * @param  {string} label
         * @param  {int} elementIndex
         * @return {int}
         */
        getLastStrikedLabelIndex: function (label, elementIndex) {
            var self = this,
                index = 0;

            for (var i = elementIndex; i > 0; i--) {
                if (self.labels[i] === label) {
                    index++;
                }
            }

            return index;
        }
    };

    // assign bingo card model class
    classes.BingoCardModel = KoBingoCardModel;

})(app.model.koModels, app.model.koClasses);