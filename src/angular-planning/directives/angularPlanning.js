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
            function getMonthsOfDays(days) {
                var months = [];
                var lastMonth = {
                    month: null,
                    nbDaysDisplayed: 0
                };
                for (var i = 0; i < days.length; i++) {
                    var month = moment(days[i].day).startOf('month');
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
                }
                return months;
            }

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
                $event.stopPropagation();
            };

            vm.getEventsDay = function (day, events) {
                return _.filter(events, function (event) {
                    return day.isSameOrAfter(moment(event.startsAt), 'day') && day.isSameOrBefore(moment(event.endsAt), 'day');
                });
            };

            /* Planning display */
            vm.dates = {
                current: null,
                dayHovered: -1,
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
                    vm.events = [];
                    var eventsPromise = $scope.getEvents({minDate: minDate.day, maxDate: maxDate.day});
                    eventsPromise.then(function (events) {
                        _.forEach(vm.dates.indices, function (index) {
                            var day = vm.getDay(index);
                            _.forEach(_.filter(vm.flattenedResources, {group: false}), function (resource) {
                                var resourceIndexEvents = vm.getEventsDay(day, events[resource.id]);
                                _.set(vm.events, [resource.id, index], resourceIndexEvents);
                            });
                        });
                    });
                }
            }

            vm.displayDates = function () {
                vm.dates.current = $scope.currentDate.clone();

                var days = [];

                var day = {
                    day: null,
                    isToday: false,
                    isEndOfWeek: false
                };

                var currentDate = vm.dates.current.clone();
                for (var i = 0; i < vm.nbDaysDisplayed; i++) {
                    day = {
                        index: i,
                        day: currentDate.toDate(),
                        dayNumber: currentDate.format('DD'),
                        weekDayName: currentDate.format('dd'),
                        isToday: vm.isToday(i),
                        isEndOfWeek: vm.isEndOfWeek(i)
                    };
                    days.push(day);
                    currentDate.add(1, 'days');
                }
                vm.dates.days = days;

                if ($scope.resources.length > 0) {
                    updateEvents();
                }

                vm.dates.indices = _.range(vm.nbDaysDisplayed);

                vm.dates.months = getMonthsOfDays(vm.dates.days);
            };

            vm.highlightDayHovered = function (index) {
                vm.dates.dayHovered = index;
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
