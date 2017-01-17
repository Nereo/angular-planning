'use strict';

angular.module('angularPlanningApp')

.directive('angularPlanning', function () {
    return {
        restrict: 'E',
        scope: {
            getResources: '&',
            currentDate: '=',
            cellWidth: '=',
            planningResourcesColumnRatio: '=',
            showDayOfWeek: '=',
            onDayHover: '&?',
            onDayClick: '&?',
            onEventClick: '&?'
        },
        templateUrl: 'angular-planning/views/angular-planning.html',
        controller: ['$scope', '$q', 'moment', '_', function PlanningController($scope, $q, moment, _) {
            /* Toggle groups */
            function toggleVisibility(resource, show) {
                for (var i = 0; i < $scope.resources.length; i++) {
                    var currentResource = $scope.resources[i];
                    if (currentResource.parentGroup === resource.id) {
                        currentResource.show = show;
                        if (currentResource.group === true && currentResource.open === true) {
                            toggleVisibility(currentResource, show);
                        }
                    }
                }
            }

            function toggleFolding(group, open) {
                if (group.group === true) {
                    toggleVisibility(group, open);
                    group.open = open;
                }
            }
            this.toggleFolding = toggleFolding;

            function initToggle() {
                for (var i = 0; i < $scope.resources.length; i++) {
                    if ($scope.resources[i].group === true) {
                        if ($scope.resources[i].parentGroup === null) {
                            $scope.resources[i].show = true;
                        }
                        toggleFolding($scope.resources[i], $scope.resources[i].open);
                    }
                }
            }

            /* Handle resourcees */
            function flattenResources(resources) {
                var _flattenResources = function (resources, parentGroupId) {
                    return _.flatMap(resources, function (resource) {
                        resource.parentGroup = parentGroupId;
                        if (resource.childs) {
                            resource.group = true;
                            return _.concat(resource, _flattenResources(resource.childs, resource.id));
                        }
                        resource.group = false;
                        return [resource];
                    });
                };
                return _flattenResources(resources, null);
            }

            function updateResources(minDate, maxDate) {
                var resourceUpdatePromise = $q.defer();

                $scope.getResources({minDate: minDate, maxDate: maxDate}).then(function (resources) {
                    resourceUpdatePromise.resolve(flattenResources(resources));
                });

                return resourceUpdatePromise.promise;
            }

            function updatePlanning() {
                var minDate = $scope.dates.days[0];
                var maxDate = $scope.dates.days[$scope.dates.days.length - 1];
                var promise = updateResources(minDate, maxDate);
                promise.then(function (resources) {
                    $scope.resources = resources;
                    initToggle();
                });
            }

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

            function isToday(day) {
                return day.isSame(moment(), 'day');
            }
            $scope.isToday = isToday;
            this.isToday = isToday;

            function isEndOfWeek(day) {
                return day.clone().endOf('week').isSame(day, 'day');
            }
            $scope.isEndOfWeek = isEndOfWeek;
            this.isEndOfWeek = isEndOfWeek;

            this.isMorningOnly = function (day, event) {
                return event.afternoonIncluded === false && event.endsAt.isSame(day, 'day');
            };

            this.isAfternoonOnly = function (day, event) {
                return event.morningIncluded === false && event.startsAt.isSame(day, 'day');
            };

            /* Handle events */
            this.onDayHover = _.debounce(
                function (day, resource) {
                    if ($scope.onDayHover && !resource.group) {
                        $scope.onDayHover({day: day, resource: resource});
                    }
                },
                250
            );

            this.onDayClick = function (day, resource) {
                if ($scope.onDayClick && !resource.group) {
                    $scope.onDayClick({day: day, resource: resource});
                }
            };

            this.onEventClick = function ($event, event, day, resource) {
                if ($scope.onEventClick && !resource.group) {
                    $scope.onEventClick({event: event, day: day, resource: resource});
                }
                $event.stopPropagation();
            };

            /* Planning display */
            $scope.dates = {
                days: [],
                months: []
            };
            $scope.nbDaysDisplayed = 0;
            $scope.planningWidth = 0;

            $scope.displayDates = function () {
                var days = [];
                var currentDate = $scope.currentDate.clone();
                for (var i = 0; i < $scope.nbDaysDisplayed; i++) {
                    days.push(currentDate.clone());
                    currentDate.add(1, 'days');
                }
                $scope.dates.days = days;
                $scope.dates.months = getMonthsOfDays($scope.dates.days);
                updatePlanning();
            };

            $scope.$watch('planningWidth', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.nbDaysDisplayed = _.floor((newValue * (1 - $scope.planningResourcesColumnRatio / 100)) / $scope.cellWidth);
                    $scope.displayDates();
                }
            });

            $scope.$watch('currentDate', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.displayDates();
                }
            }, true);

            $scope.displayDates();
        }]
    };
});
