/**
 * @ngdoc function
 * @name KeyPress
 * @description
 * KeyPress Library Factory for AngularJS module Injection
 */
angular.module('keypress', [])
    .factory(
        'keypress',
        function() {
            //return $window.keypress;
            var keypress = window.keypress;

            // OPTIONAL: Delete the global reference to make sure
            // that no one on the team gets lazy and tries to reference the library
            // without injecting it.
            delete(window.keypress);

            // Return the [formerly global] reference so that it can be injected
            // into other aspects of the app.
            return (keypress);
        });