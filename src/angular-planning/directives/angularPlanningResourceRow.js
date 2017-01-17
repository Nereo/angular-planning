'use strict';

angular.module('angularPlanningApp')

.directive('angularPlanningResourceRow', function () {
    return {
        require: '^^angularPlanning',
        restrict: 'A',
        scope: {
            resource: '=',
            events: '=',
            dates: '='
        },
        link: function (scope, element, attrs, planningController) {
            scope.planningController = planningController;
        },
        templateUrl: 'angular-planning/views/angular-planning-resource-row.html'
    };
});
