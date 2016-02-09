/*
     _  __                 _     ____        _   
    | |/ /                | |   / __ \      | |  
    | ' / _ __   ___   ___| | _| |  | |_   _| |_ 
    |  < | '_ \ / _ \ / __| |/ / |  | | | | | __|
    | . \| | | | (_) | (__|   <| |__| | |_| | |_ 
    |_|\_\_| |_|\___/ \___|_|\_\\____/ \__,_|\__|
      _____          _                    ______      _                 _               
     / ____|        | |                  |  ____|    | |               | |              
    | |    _   _ ___| |_ ___  _ __ ___   | |__  __  _| |_ ___ _ __   __| | ___ _ __ ___ 
    | |   | | | / __| __/ _ \| '_ ` _ \  |  __| \ \/ / __/ _ \ '_ \ / _` |/ _ \ '__/ __|
    | |___| |_| \__ \ || (_) | | | | | | | |____ >  <| ||  __/ | | | (_| |  __/ |  \__ \
     \_____\__,_|___/\__\___/|_| |_| |_| |______/_/\_\\__\___|_| |_|\__,_|\___|_|  |___/
 */
_.extend(ko.extenders, {

    /**
     * Extending of observable to force numeric value
     * 
     * @param  {observable} target
     * @param  {int} precision [number of decimals]
     * @return {void}
     */
    numeric : function(target, precision) {
        var result = ko.computed({
            read: target,
            write: function(newValue) {
                var current = target(),
                    valueToWrite = isNaN(parseFloat(newValue).toFixed(precision)) ? 0 : parseFloat(newValue).toFixed(precision);
                
                if ( valueToWrite !== current ) {
                    target(valueToWrite);
                } else {
                    if ( newValue !== current ) {
                       target.notifySubscribers( valueToWrite );
                    }
                }
            }
        });

        return result;
    },

    /**
     * Extending of observable to specify a max number
     * 
     * @param  {observable} target
     * @param  {int} max
     * @return {void}
     */
    maxNumber : function(target, max){
        var result = ko.computed({
            read: target,
            write: function(newValue){
                var current = target(),
                    maxValue = ko.isObservable(max) ? max() : max,
                    valueToWrite = (newValue > maxValue) ? maxValue : newValue;

                if ( valueToWrite !== current ){
                    target( valueToWrite )
                }else{
                    if ( newValue !== current ){
                        target.notifySubscribers( valueToWrite );
                    }
                }
            }
        });

        return result;
    },

    /**
     * Extending of observable to specify a min number
     * 
     * @param  {observable} target
     * @param  {int} min
     * @return {void}
     */
    minNumber : function(target, min){
        var result = ko.computed({
            read: target,
            write: function(newValue){
                var current = target(),
                    valueToWrite = (newValue < min) ? min : newValue;

                if ( valueToWrite !== current ){
                    target( valueToWrite )
                }else{
                    if ( newValue !== current ){
                        target.notifySubscribers( valueToWrite );
                    }
                }
            }
        });

        return result;
    }
});