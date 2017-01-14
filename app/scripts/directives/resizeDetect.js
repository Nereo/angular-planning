'use strict';

angular.module('angularPlanningApp')

.directive('resizeDetect', ['_', '$window', function(_, $window) {
    return {
        restrict: 'A',
        scope: {
            watchedWidth: '='
        },
        link: function (scope, element) {
            scope.watchedWidth = element[0].offsetWidth;
            $window.onresize = _.debounce(
                function() {
                    scope.$apply(function() { scope.watchedWidth = element[0].offsetWidth; });
                },
                100
            );
        }
    };
}]);
