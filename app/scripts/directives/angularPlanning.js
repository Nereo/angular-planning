'use strict';

angular.module('angularPlanningApp')

.directive('angularPlanning', function() {
    return {
        restrict: 'E',
        scope: {
            'getResources': '&',
            'currentDate': '=',
            'leapSize': '=',
            'onDayHover': '&?',
            'onDayClick': '&?',
            'onEventClick': '&?'
        },
        templateUrl: 'views/angular-planning.html',
        controller: ['$scope', '$q', '_', function PlanningController($scope, $q, _) {
            $scope.dates = {
                days: [],
                months: []
            };

            /* Toggle groups */
            function toggleVisibility(resource, show) {
                for (var i = 0 ; i < $scope.resources.length ; i++) {
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
                for (var i = 0 ; i < $scope.resources.length ; i++) {
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
                var _flattenResources = function(resources, parentGroupId) {
                    return _.flatMap(resources, function(resource) {
                        resource.parentGroup = parentGroupId;
                        if (resource.childs) {
                            resource.group = true;
                            return _.concat(resource, _flattenResources(resource.childs, resource.id));
                        }
                        else {
                            resource.group = false;
                            return [resource];
                        }
                    });
                };
                return _flattenResources(resources, null);
            }

            function updateResources(minDate, maxDate) {
                var resourceUpdatePromise = $q.defer();

                $scope.getResources({minDate: minDate, maxDate: maxDate}).then(function(resources) {
                    resourceUpdatePromise.resolve(flattenResources(resources));
                });

                return resourceUpdatePromise.promise;
            }

            function updatePlanning() {
                var minDate = $scope.dates.days[0];
                var maxDate = $scope.dates.days[$scope.dates.days.length - 1];
                var promise = updateResources(minDate, maxDate);
                promise.then(function(resources) {
                    $scope.resources = resources;
                    initToggle();
                });
            }

            /* Display dates */
            function getMonthsOfDays(days) {
                var months = [];
                var lastMonth = {
                    month: null,
                    nbDaysDisplayed: 0
                };
                for (var i = 0 ; i < days.length ; i++) {
                    var month = days[i].clone().startOf('month');
                    if (!month.isSame(lastMonth.month, 'month')) {
                        lastMonth = {
                            month: month,
                            nbDaysDisplayed: 1
                        };
                        months.push(lastMonth);
                    }
                    else {
                        lastMonth.nbDaysDisplayed++;
                    }
                }
                return months;
            }

            this.isEndOfWeek = function(day) {
                return day.clone().endOf('week').isSame(day, 'day');
            };

            this.isMorningOnly = function(day, event) {
                return event.afternoonIncluded === false && event.endsAt.isSame(day, 'day');
            };

            this.isAfternoonOnly = function(day, event) {
                return event.morningIncluded === false && event.startsAt.isSame(day, 'day');
            };

            $scope.addDaysAfter = function() {
                var currentDate = $scope.dates.days[$scope.dates.days.length - 1].clone();
                for (var i = 0 ; i < $scope.leapSize ; i++) {
                    currentDate.add(1, 'days');
                    $scope.dates.days.push(currentDate.clone());
                }
                $scope.dates.months = getMonthsOfDays($scope.dates.days);

                updatePlanning();
            };

            $scope.addDaysBefore = function() {
                var currentDate = $scope.dates.days[0].clone();
                for (var i = 0 ; i < $scope.leapSize ; i++) {
                    currentDate.add(-1, 'days');
                    $scope.dates.days.unshift(currentDate.clone());
                }
                $scope.dates.months = getMonthsOfDays($scope.dates.days);

                updatePlanning();
            };

            /* Handle events */
            this.onDayHover = _.debounce(
                function(day, resource) {
                    if ($scope.onDayHover && !resource.group) {
                        $scope.onDayHover({day: day, resource: resource});
                    }
                },
                250
            );

            this.onDayClick = function(day, resource) {
                if ($scope.onDayClick && !resource.group) {
                    $scope.onDayClick({day: day, resource: resource});
                }
            };

            this.onEventClick = function($event, event, day, resource) {
                if ($scope.onEventClick && !resource.group) {
                    $scope.onEventClick({event: event, day: day, resource: resource});
                }
                $event.stopPropagation();
            };

            /* Init */
            function initDate(date) {
                $scope.dates.days = [date];
                $scope.addDaysAfter();
            }
            $scope.$watch('currentDate', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    initDate(newValue);
                }
            });
            initDate($scope.currentDate);
        }]
    };
});
