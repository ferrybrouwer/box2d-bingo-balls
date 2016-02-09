/**
 * For browsers which doesn't support console
 * Simulate a console logger so no errors will be triggered by te browser
 *
 * @author Ferry Brouwer <ferry@happy-online.nl>
 * @see chrome:console
 */
(function () {
    'use strict';

    if (typeof console === 'undefined') {

        var _Console = function () {};
        var consoleMethods = ['assert', 'clear', 'dir', 'debug', 'count', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile',
            'table', 'time', 'timeEnd', 'timeStamp', 'timeline', 'timelineEnd', 'trace', 'warn'];

        for (var i = 0; i < consoleMethods.length; i++) {
            _Console['prototype']['constructor'] = _Console;
            _Console['prototype'][consoleMethods[i]] = function () {};
        }

        window.console = new _Console();
    }

})();