'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
factory('MBeans', function ($resource) {
    return $resource('/mbeans/:host/:port', {host: '@host', port: '@port', username: '@username', password: '@password'}, {
        get: {method: 'POST', params: {}, isArray: true}
    });
});
