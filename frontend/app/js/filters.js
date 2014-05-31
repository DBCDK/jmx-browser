'use strict';

/* Filters */

angular.module('myApp.filters', []).
filter('regex', function() {
    return function(input, regex) {
        var pattern = new RegExp(regex);      
        console.log("regex: " + regex);
        var out = [];
        input.forEach( function(i) {
            if (pattern.test(i.id)) {
                console.log(i.id + ": match");
                out.push(i);
            };
        });
        return out;
    };
}).
filter('iif', function () {
   return function(input, trueValue, falseValue) {
        return input ? trueValue : falseValue;
   };
}).
filter('interpolate', ['version', function(version) {
    return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    }
}]);
