'use strict';

angular.module('angularPlanningApp')

.directive('resizeDetect', function (_, $window) {
    return {
        restrict: 'A',
        scope: {
            watchedWidth: '='
        },
        link: function (scope, element) {
            scope.watchedWidth = element[0].offsetWidth;
            $window.onresize = _.debounce(
                function () {
                    if ($window.matchMedia('print').matches === false) { /* Disable resize on printing */
                        scope.$apply(function () {
                            scope.watchedWidth = element[0].offsetWidth;
                        });
                    }
                },
                100
            );
        }
    };
});
