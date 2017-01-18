var moment;
var _;

angular
  .module('angularPlanningApp', [])
  .constant('moment', moment)
  .constant('_', _)
;

'use strict';

angular.module('angularPlanningApp')

.directive('angularPlanning', function () {
    return {
        restrict: 'E',
        scope: {
            getEvents: '&',
            resources: '=',
            currentDate: '=',
            cellWidth: '=',
            planningResourcesColumnRatio: '=',
            showDayOfWeek: '=',
            onDayHover: '&?',
            onDayClick: '&?',
            onEventClick: '&?'
        },
        templateUrl: 'angular-planning/views/angular-planning.html',
        controllerAs: 'vm',
        controller: ['$scope', '$q', 'moment', '_', function PlanningController($scope, $q, moment, _) {
            var vm = this;

            /* Toggle groups */
            function toggleVisibility(resource, show) {
                for (var i = 0; i < vm.flattenedResources.length; i++) {
                    var currentResource = vm.flattenedResources[i];
                    if (currentResource.parentGroup === resource.id) {
                        currentResource.show = show;
                        if (currentResource.group === true && currentResource.open === true) {
                            toggleVisibility(currentResource, show);
                        }
                    }
                }
            }

            vm.toggleFolding = function (group, open) {
                if (group.group === true) {
                    toggleVisibility(group, open);
                    group.open = open;
                }
            };

            function initToggle() {
                for (var i = 0; i < vm.flattenedResources.length; i++) {
                    if (vm.flattenedResources[i].group === true) {
                        if (vm.flattenedResources[i].parentGroup === null) {
                            vm.flattenedResources[i].show = true;
                        }
                        vm.toggleFolding(vm.flattenedResources[i], vm.flattenedResources[i].open);
                    }
                }
            }

            /* Handle resources */
            vm.flattenedResources = [];
            function flattenResources(resources) {
                var _flattenResources = function (resources, parentGroupId) {
                    return _.flatMap(resources, function (resource) {
                        resource.parentGroup = parentGroupId;
                        if (resource.children) {
                            resource.group = true;
                            return _.concat(resource, _flattenResources(resource.children, resource.id));
                        }
                        resource.group = false;
                        return [resource];
                    });
                };
                return _flattenResources(resources, null);
            }

            $scope.$watchCollection('resources', function (resources) {
                vm.flattenedResources = flattenResources(resources);
                initToggle();
                updateEvents();
            });

            /* Dates utilities */
            function getMonthsOfDays(days) {
                var months = [];
                var lastMonth = {
                    month: null,
                    nbDaysDisplayed: 0
                };
                for (var i = 0; i < days.length; i++) {
                    var month = days[i].clone().startOf('month');
                    if (month.isSame(lastMonth.month, 'month') === false) {
                        lastMonth = {
                            month: month,
                            nbDaysDisplayed: 1
                        };
                        months.push(lastMonth);
                    } else {
                        lastMonth.nbDaysDisplayed++;
                    }
                }
                return months;
            }

            vm.isToday = function (day) {
                return day.isSame(moment(), 'day');
            };

            vm.isEndOfWeek = function (day) {
                return day.clone().endOf('week').isSame(day, 'day');
            };

            vm.isMorningOnly = function (day, event) {
                return event.afternoonIncluded === false && event.endsAt.isSame(day, 'day');
            };

            vm.isAfternoonOnly = function (day, event) {
                return event.morningIncluded === false && event.startsAt.isSame(day, 'day');
            };

            /* Handle events */
            vm.onDayHover = _.debounce(
                function (day, resource) {
                    if ($scope.onDayHover && !resource.group) {
                        $scope.onDayHover({day: day, resource: resource});
                    }
                },
                250
            );

            vm.onDayClick = function (day, resource) {
                if ($scope.onDayClick && !resource.group) {
                    $scope.onDayClick({day: day, resource: resource});
                }
            };

            vm.onEventClick = function ($event, event, day, resource) {
                if ($scope.onEventClick && !resource.group) {
                    $scope.onEventClick({event: event, day: day, resource: resource});
                }
                $event.stopPropagation();
            };

            /* Planning display */
            vm.dates = {
                days: [],
                months: []
            };
            vm.nbDaysDisplayed = 0;
            vm.planningWidth = 0;

            function updateEvents() {
                var minDate = vm.dates.days[0];
                var maxDate = vm.dates.days[vm.dates.days.length - 1];

                if (_.isUndefined(minDate) === false && _.isUndefined(maxDate) === false) {
                    var promise = $scope.getEvents({minDate: minDate, maxDate: maxDate});
                    promise.then(function (events) {
                        $scope.events = events;
                    });
                }
            }

            vm.displayDates = function () {
                var days = [];
                var currentDate = $scope.currentDate.clone();
                for (var i = 0; i < vm.nbDaysDisplayed; i++) {
                    days.push(currentDate.clone());
                    currentDate.add(1, 'days');
                }
                vm.dates.days = days;
                vm.dates.months = getMonthsOfDays(vm.dates.days);

                if ($scope.resources.length > 0) {
                    updateEvents();
                }
            };

            $scope.$watch('planningWidth', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    vm.nbDaysDisplayed = _.floor((newValue * (1 - $scope.planningResourcesColumnRatio / 100)) / $scope.cellWidth);
                    vm.displayDates();
                }
            });

            $scope.$watch('currentDate', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    vm.displayDates();
                }
            }, true);
        }]
    };
});

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

'use strict';

angular.module('angularPlanningApp')

.directive('resizeDetect', ["_", "$window", function (_, $window) {
    return {
        restrict: 'A',
        scope: {
            watchedWidth: '='
        },
        link: function (scope, element) {
            scope.watchedWidth = element[0].offsetWidth;
            $window.onresize = _.debounce(
                function () {
                    scope.$apply(function () {
                        scope.watchedWidth = element[0].offsetWidth;
                    });
                },
                100
            );
        }
    };
}]);
