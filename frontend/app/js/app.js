'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/mbeans.html', controller: 'MBeanCtrl'});
  $routeProvider.when('/m2', {templateUrl: 'partials/mbeans2.html', controller: 'MBeanCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
