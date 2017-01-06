'use strict';

angular.module('angularPlanningApp')

.directive('scrollDetect', [function() {
    return {
        restrict: 'A',
        scope: {
            onScrollBegin: '&?',
            onScrollEnd: '&?',
            edgeThresholdFactor: '=?',
            cellsClassToFollow: '@?'
        },
        link: function (scope, element) {
            var raw = element[0];
            
            if (!scope.edgeThresholdFactor) {
                scope.edgeThresholdFactor = 0.9;
            }

            if (scope.cellsClassToFollow) {
                var cellsToFollow = raw.getElementsByClassName(scope.cellsClassToFollow);
            }
            var followScroll = function(cellsToFollow, raw) {
                for (var i = 0 ; i < cellsToFollow.length ; i++) {
                    var cell = cellsToFollow[i];
                    var cellWidth = cell.clientWidth;
                    var cellLeftPosition = cell.offsetLeft;
                    var cellRightPosition = cellLeftPosition + cellWidth;
                    var child = cell.getElementsByTagName('span')[0];
                    if (raw.scrollLeft > cellLeftPosition && raw.scrollLeft < cellRightPosition) {
                        var leftPosition = (raw.scrollLeft - cellLeftPosition);
                        var maxPosition = cellWidth - child.clientWidth - 10;
                        child.style = 'left: ' + Math.min(leftPosition, maxPosition) + 'px';
                    }
                    else {
                        child.style = 'left: 0px';
                    }
                }
            };

            element.bind('scroll', function () {
                followScroll(cellsToFollow, raw);

                var minScroll = raw.scrollWidth * (1 - scope.edgeThresholdFactor);
                if (scope.onScrollBegin && raw.scrollLeft <= minScroll) {
                    var originalWidth = raw.scrollWidth;
                    var originalScrollLeft = raw.scrollLeft;
                    scope.$apply(scope.onScrollBegin);
                    raw.scrollLeft = raw.scrollWidth - originalWidth + originalScrollLeft;
                }

                var maxScroll = (raw.scrollWidth - raw.clientWidth) * scope.edgeThresholdFactor;
                if (scope.onScrollEnd && raw.scrollLeft >= maxScroll) {
                    scope.$apply(scope.onScrollEnd);
                }
            });
        }
    };
}]);
