/**
 * Underscore extensions Utilities
 * Happy Online
 */
(function(){

    _.mixin({

        /**
         * Check if given url is an audio file
         * 
         * @param  {string}  url
         * @return {Boolean}
         */
        isAudio: function(url) {
            return (/(\.(mp3)|(wav)|(m4a)|(aiff)|(ape)|(flac)|(ac3)|(aac)|(ogg))$/).test(url.toLowerCase());
        },

        /**
         * Check if given url is an image file
         * 
         * @param  {string}  url
         * @return {Boolean}
         */
        isImage: function(url) {
            return (/(\.(jpg)|(jpeg)|(png)|(bmp)|(tiff))$/).test(url);
        }
    });

})();