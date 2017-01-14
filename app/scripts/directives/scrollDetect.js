'use strict';

angular.module('angularPlanningApp')

.directive('scrollDetect', [function() {
    return {
        restrict: 'A',
        scope: {
            cellsClassToFollow: '@?'
        },
        link: function (scope, element) {
            var raw = element[0];

            if (scope.cellsClassToFollow) {
                var cellsToFollow = raw.getElementsByClassName(scope.cellsClassToFollow);
            }

            var followScroll = function(cellsToFollow, raw) {
                for (var i = 0 ; i < cellsToFollow.length ; i++) {
                    console.log(raw.scrollTop);
                    var cell = cellsToFollow[i];
                    cell.style.cssText = 'top: ' + raw.scrollTop + 'px';
                }
            };

            element.bind('scroll', function () {
                followScroll(cellsToFollow, raw);
            });
        }
    };
}]);
