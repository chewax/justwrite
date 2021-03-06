'use strict';

// Declare app level module which depends on views, and components
angular.module('justWrite', [
  'ngRoute',
  'keypress',
  'lodash',
  'justWrite.editor'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/editor'});
}]);
