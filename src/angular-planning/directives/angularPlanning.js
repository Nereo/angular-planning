'use strict';

angular.module('angularPlanningApp')

.directive('angularPlanning', function () {
    return {
        restrict: 'E',
        scope: {
            events: '=',
            updateEvents: '&',
            resources: '=',
            currentDate: '=',
            lastDate: '=?',
            cellWidth: '=',
            planningResourcesColumnRatio: '=',
            showDayOfWeek: '=',
            onDayHover: '&?',
            onDayClick: '&?',
            onEventClick: '&?'
        },
        templateUrl: 'angular-planning/views/angular-planning.html',
        controllerAs: 'vm',
        controller: ['$scope', '$q', '$cacheFactory', '$window', '$timeout', 'moment', '_', function PlanningController($scope, $q, $cacheFactory, $window, $timeout, moment, _) {
            var vm = this;
            var dateIndexCache = $cacheFactory('planning-date-index-cache'); /* Store in cache dates for each index */

            /* Destroy cache on directive destroy to prevent duplicate cache already taken exception */
            $scope.$on('$destroy', function () {
                dateIndexCache.destroy();
            });

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

            function initToggle(forceOpen) {
                for (var i = 0; i < vm.flattenedResources.length; i++) {
                    if (vm.flattenedResources[i].group === true) {
                        if (vm.flattenedResources[i].parentGroup === null) {
                            vm.flattenedResources[i].show = true;
                        }
                        vm.toggleFolding(vm.flattenedResources[i], forceOpen ? forceOpen : vm.flattenedResources[i].open);
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
                /* Activate watchers to reflect changes and disable them when DOM is finished */
                $scope.$broadcast('resume');
                $timeout(
                    function () {
                        $scope.$broadcast('suspend');
                    },
                    0,
                    false
                );

                vm.flattenedResources = flattenResources(resources);
                initToggle();
                updateEvents();
            });

            /* Dates utilities */
            vm.getDay = function (index) {
                if (dateIndexCache.get(index)) {
                    return dateIndexCache.get(index);
                }
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
                var dayKey = vm.getDay(index).format('YYYY-MM-DD');
                return _.get(vm.events, [resourceId, dayKey], []);
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

            function updateEvents() {
                var minDate = vm.dates.days[0];
                var maxDate = vm.dates.days[vm.dates.days.length - 1];
                if (_.isUndefined(minDate) === false && _.isUndefined(maxDate) === false) {
                    $scope.updateEvents({minDate: minDate.day, maxDate: maxDate.day});
                }
            }

            vm.events = [];
            $scope.$watchCollection('events', function (events) {
                var minDate = vm.dates.days[0];
                var maxDate = vm.dates.days[vm.dates.days.length - 1];

                if (_.isUndefined(minDate) === false && _.isUndefined(maxDate) === false) {
                    vm.events = [];
                    _.forEach(vm.dates.indices, function (index) {
                        var day = vm.getDay(index);
                        var dayKey = day.format('YYYY-MM-DD');
                        _.forEach(events, function (event) {
                            if (day.isSameOrAfter(moment(event.startsAt), 'day') && day.isSameOrBefore(moment(event.endsAt), 'day')) {
                                _.set(
                                    vm.events,
                                    [event.resourceId, dayKey],
                                    _.concat(_.get(vm.events, [event.resourceId, dayKey], []), event)
                                );
                            }
                        });
                    });
                }
            });

            vm.computeNbDaysDisplayed = function () {
                /* If we have last date, force the nbDaysDisplayed */
                if ($scope.lastDate) {
                    vm.nbDaysDisplayed = $scope.lastDate.diff($scope.currentDate, 'days') + 1;
                } else {
                    vm.nbDaysDisplayed = _.floor(($scope.planningWidth * (1 - $scope.planningResourcesColumnRatio / 100)) / $scope.cellWidth);
                }
            };

            vm.displayDates = function () {
                /* Activate watchers to reflect changes and disable them when DOM is finished */
                $scope.$broadcast('resume');
                $timeout(
                    function () {
                        $scope.$broadcast('suspend');
                    },
                    0,
                    false
                );

                dateIndexCache.removeAll(); /* Remove cache, as indices will change */

                vm.computeNbDaysDisplayed();

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

                    dateIndexCache.put(i, currentDate.clone());

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
