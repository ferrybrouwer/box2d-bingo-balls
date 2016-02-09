/**
 * Payment Request Knockout Model
 *
 * @param {function}    $           [jquery]
 * @param {object}      models      [contains class instances]
 * @param {object}      classes     [contains classes]
 */
(function($, models, classes){
    'use strict';

    /**
     * Progress Knockout Model
     * Handle progress updates from progress elements
     *
     * @constructor
     */
    function KoProgressModel(){
        this.progress = ko.observable(0);
    }

    // assign progress model class
    classes.ProgressModel = KoProgressModel;

})(jQuery, app.model.koModels, app.model.koClasses);