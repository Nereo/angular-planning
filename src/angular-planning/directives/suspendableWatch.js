'use strict';

angular.module('angularPlanningApp')

.directive('suspendableWatch', function () {
    return {
        link: function (scope) {
            // Heads up: this might break is suspend/resume called out of order
            // or if watchers are added while suspended
            var watchers;

            scope.$on('suspend', function () {
                watchers = scope.$$watchers;
                scope.$$watchers = [];
            });

            scope.$on('resume', function () {
                if (watchers) {
                    scope.$$watchers = watchers;
                }

                // discard our copy of the watchers
                watchers = undefined;
            });
        }
    };
});
