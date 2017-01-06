'use strict';

angular.module('angularPlanningApp')

.directive('angularPlanningResourceRow', function() {
    return {
        require: '^^angularPlanning',
        restrict: 'A',
        scope: {
            'resource': '=',
            'dates': '='
        },
        link: function(scope, element, attrs, planningController) {
            scope.planningController = planningController;
        },
        templateUrl: 'views/angular-planning-resource-row.html'
    };
});
