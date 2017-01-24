'use strict';

angular.module('angularPlanningApp')

.directive('onClick', function () {
    return function (scope, element, attr) {
        element.on('click', function (event) {
            scope.$eval(attr.onClick);
            event.stopPropagation();
        });
    };
});
