(function() {
    /**
     * @ngdoc function
     * @name LoDash
     * @description
     * LoDash Library Factory for AngularJS module Injection
     */
    angular.module('lodash', [])
        .factory(
            '_',
            function() {

                //return $window._;
                var _ = window._;

                // OPTIONAL: Delete the global reference to make sure
                // that no one on the team gets lazy and tries to reference the library
                // without injecting it.
                delete(window._);


                // CUSTOM LODASH METHODS
                //========================================================================
                /**
                 * Transform received object into querystring.
                 * @param obj
                 * @returns {string}
                 */
                _.toQueryString = function(obj) {
                    return "?" + _.map(obj, function(v,k){
                        return encodeURIComponent(k) + '=' + encodeURIComponent(v);
                    }).join("&");
                };

                // Return the [formerly global] reference so that it can be injected
                // into other aspects of the app.
                return (_);
            });
})();
