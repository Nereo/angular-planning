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
                var _flattenResources = function (resources, parentGroupId, depth) {
                    return _.flatMap(resources, function (resource) {
                        resource.parentGroup = parentGroupId;
                        resource.depth = depth;
                        if (resource.children) {
                            resource.group = true;
                            return _.concat(resource, _flattenResources(resource.children, resource.id, depth + 1));
                        }
                        resource.group = false;
                        return [resource];
                    });
                };
                return _flattenResources(resources, null, 0);
            }

            $scope.$watchCollection('resources', function (resources) {
                vm.flattenedResources = flattenResources(resources);
                initToggle();
                updateEvents();
            });

            /* Dates utilities */
            vm.getDay = function (index) {
                return vm.dates.current.clone().add(index, 'days');
            };

            vm.isToday = function (index) {
                return vm.getDay(index).isSame(moment(), 'day');
            };

            vm.isEndOfWeek = function (index) {
                var day = vm.getDay(index);
                return day.clone().endOf('week').isSame(day, 'day');
            };

            vm.isMorningOnly = function (index, event) {
                var day = vm.getDay(index);
                return event.afternoonIncluded === false && moment(event.endsAt).isSame(day, 'day');
            };

            vm.isAfternoonOnly = function (index, event) {
                var day = vm.getDay(index);
                return event.morningIncluded === false && moment(event.startsAt).isSame(day, 'day');
            };

            /* Handle events */
            vm.onDayHover = _.debounce(
                function (index, resource) {
                    if ($scope.onDayHover && !resource.group) {
                        var day = vm.getDay(index).toDate();
                        $scope.onDayHover({day: day, resource: resource});
                    }
                },
                250
            );

            vm.onDayClick = function (index, resource) {
                if ($scope.onDayClick && !resource.group) {
                    var day = vm.getDay(index).toDate();
                    $scope.onDayClick({day: day, resource: resource});
                }
            };

            vm.onEventClick = function ($event, event, index, resource) {
                if ($scope.onEventClick && !resource.group) {
                    var day = vm.getDay(index).toDate();
                    $scope.onEventClick({event: event, day: day, resource: resource});
                }
            };

            vm.getEventsDay = function (index, resourceId) {
                var day = vm.getDay(index);
                return _.filter(vm.events[resourceId], function (event) {
                    return day.isSameOrAfter(moment(event.startsAt), 'day') && day.isSameOrBefore(moment(event.endsAt), 'day');
                });
            };

            /* Planning display */
            vm.dates = {
                current: null,
                indices: [],
                days: [],
                months: []
            };
            vm.nbDaysDisplayed = 0;
            vm.planningWidth = 0;

            vm.events = [];
            function updateEvents() {
                var minDate = vm.dates.days[0];
                var maxDate = vm.dates.days[vm.dates.days.length - 1];

                if (_.isUndefined(minDate) === false && _.isUndefined(maxDate) === false) {
                    var eventsPromise = $scope.getEvents({minDate: minDate.day, maxDate: maxDate.day});
                    eventsPromise.then(function (events) {
                        vm.events = events;
                    });
                }
            }

            vm.displayDates = function () {
                vm.dates.current = $scope.currentDate.clone();

                var days = [];
                var months = [];

                var day = {
                    day: null,
                    isToday: false,
                    isEndOfWeek: false
                };
                var lastMonth = {
                    month: null,
                    nbDaysDisplayed: 0
                };

                var currentDate = vm.dates.current.clone();
                var month = currentDate.clone().startOf('month');
                for (var i = 0; i < vm.nbDaysDisplayed; i++) {
                    /* Compute day */
                    day = {
                        index: i,
                        day: currentDate.toDate(),
                        dayNumber: currentDate.format('DD'),
                        weekDayName: currentDate.format('dd'),
                        isToday: vm.isToday(i),
                        isEndOfWeek: vm.isEndOfWeek(i)
                    };
                    days.push(day);
                    /* Process month */
                    if (month.isSame(lastMonth.month, 'month') === false) {
                        lastMonth = {
                            month: month.toDate(),
                            monthName: month.format('MMMM YYYY'),
                            nbDaysDisplayed: 1
                        };
                        months.push(lastMonth);
                    } else {
                        lastMonth.nbDaysDisplayed++;
                    }

                    currentDate.add(1, 'days');
                    month = currentDate.clone().startOf('month');
                }
                vm.dates.days = days;
                vm.dates.months = months;

                if ($scope.resources.length > 0) {
                    updateEvents();
                }

                vm.dates.indices = _.range(vm.nbDaysDisplayed);
            };

            $scope.$watch('planningWidth', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    vm.nbDaysDisplayed = _.floor((newValue * (1 - $scope.planningResourcesColumnRatio / 100)) / $scope.cellWidth);
                    vm.dates.indices = [];
                    vm.displayDates();
                }
            });

            $scope.$watch(
                function () {
                    return $scope.currentDate.unix();
                },
                function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        vm.displayDates();
                    }
                }
            );
        }]
    };
});

'use strict';

angular.module('angularPlanningApp')

.directive('highlightHoveredDay', function () {
    function getElementById(id) {
        /* eslint angular/document-service: 0 */
        return angular.element(document.querySelector(id));
    }

    return function (scope, element, attr) {
        element.on('mouseenter', function () {
            getElementById('#day-number-' + attr.highlightHoveredDay).addClass('planning-day-hovered-cell');
            getElementById('#day-weekdayname-' + attr.highlightHoveredDay).addClass('planning-day-hovered-cell');
        });

        element.on('mouseleave', function () {
            getElementById('#day-number-' + attr.highlightHoveredDay).removeClass('planning-day-hovered-cell');
            getElementById('#day-weekdayname-' + attr.highlightHoveredDay).removeClass('planning-day-hovered-cell');
        });
    };
});

'use strict';

angular.module('angularPlanningApp')

.directive('onMouseEnter', function () {
    return function (scope, element, attr) {
        element.on('mouseenter', function () {
            scope.$eval(attr.onMouseEnter);
        });
    };
});

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

'use strict';

angular.module('angularPlanningApp')

.directive('onMouseEnter', function () {
    return function (scope, element, attr) {
        element.on('mouseenter', function () {
            scope.$eval(attr.onMouseEnter);
        });
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
