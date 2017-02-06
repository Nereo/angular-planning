'use strict';

angular.module('angularPlanningApp')

.directive('angularPlanning', function () {
    return {
        restrict: 'E',
        scope: {
            getEvents: '&',
            resources: '=',
            currentDate: '=',
            lastDate: '=',
            cellWidth: '=',
            planningResourcesColumnRatio: '=',
            showDayOfWeek: '=',
            onDayHover: '&?',
            onDayClick: '&?',
            onEventClick: '&?'
        },
        templateUrl: 'angular-planning/views/angular-planning.html',
        controllerAs: 'vm',
        controller: ['$scope', '$q', '$cacheFactory', '$window', 'moment', '_', function PlanningController($scope, $q, $cacheFactory, $window, moment, _) {
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

            vm.events = [];
            function updateEvents() {
                var minDate = vm.dates.days[0];
                var maxDate = vm.dates.days[vm.dates.days.length - 1];

                if (_.isUndefined(minDate) === false && _.isUndefined(maxDate) === false) {
                    var eventsPromise = $scope.getEvents({minDate: minDate.day, maxDate: maxDate.day});
                    eventsPromise.then(function (events) {
                        vm.events = [];
                        _.forEach(vm.dates.indices, function (index) {
                            var day = vm.getDay(index);
                            var dayKey = day.format('YYYY-MM-DD');
                            _.forEach(events, function (resourceEvents, resourceId) {
                                var resourceDayEvents = [];
                                _.forEach(resourceEvents, function (event) {
                                    if (day.isSameOrAfter(moment(event.startsAt), 'day') && day.isSameOrBefore(moment(event.endsAt), 'day')) {
                                        resourceDayEvents.push(event);
                                    }
                                });
                                if (resourceDayEvents.length > 0) {
                                    _.set(vm.events, [resourceId, dayKey], resourceDayEvents);
                                }
                            });
                        });
                    });
                }
            }

            vm.computeNbDaysDisplayed = function () {
                /* If we are printing, take into account the lastDate instead of device width */
                if ($window.matchMedia('print').matches) {
                    vm.nbDaysDisplayed = $scope.lastDate.clone().diff($scope.currentDate, 'days') + 1;
                } else {
                    vm.nbDaysDisplayed = _.floor(($scope.planningWidth * (1 - $scope.planningResourcesColumnRatio / 100)) / $scope.cellWidth);
                }
            };

            vm.displayDates = function () {
                dateIndexCache.removeAll(); /* Remove cache, as indices will change */

                vm.dates.indices = [];
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
                    vm.displayDates();
                }
            });

            $window.matchMedia('print').addListener(function (matchMedia) {
                vm.displayDates();
                initToggle(matchMedia.matches); /* Toggle all groups open if print */
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
