'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
factory('MBeans', function ($resource) {
    return $resource('/mbeans/:host/:port', {host: '@host', port: '@port'}, {
        get: {method: 'GET', params: {}, isArray: true}
    });
});
