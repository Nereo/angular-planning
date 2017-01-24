'use strict';

angular.module('angularPlanningApp')

.directive('onMouseEnter', function () {
    return function (scope, element, attr) {
        element.on('mouseenter', function () {
            scope.$eval(attr.onMouseEnter);
        });
    };
});
