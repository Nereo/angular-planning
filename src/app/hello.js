angular
    .module('app')
    .controller('AppController', function ($scope, moment, $q, $timeout, $log) {
        var vm = this;
        moment.locale('fr');

        vm.currentDate = moment();
        vm.lastDate = moment().add(90, 'days');

        vm.addDays = function (nbDays) {
            vm.currentDate.add(nbDays, 'days');
        };

        vm.goToDateString = '';
        vm.goToDate = function () {
            vm.currentDate = moment(vm.goToDateString, 'MM/DD/YYYY');
        };

        vm.onDayHover = function (day, resource) {
            $log.log('Day hovered', day, resource);
        };
        vm.onDayClick = function (day, resource) {
            $log.log('Day clicked', day, resource);
        };
        vm.onEventClick = function (event, day, resource) {
            $log.log('Event clicked', event, day, resource);
        };

        vm.updateResource = function () {
            $scope.$broadcast('updatePlanningResource', 4);
        };

        vm.resources = [];
        vm.getResourcesAsync = function () {
            $timeout(function () {
                vm.resources = [
                    {
                        id: 1,
                        name: 'TV Series',
                        open: true,
                        children: [
                            {
                                id: 2,
                                name: 'Game of Thrones',
                                open: true,
                                children: [
                                    {
                                        id: 3,
                                        name: 'Stark',
                                        open: true,
                                        children: [
                                            {
                                                id: 4,
                                                name: 'Jon Snow'
                                            },
                                            {
                                                id: 5,
                                                name: 'Sansa Stark'
                                            }
                                        ]
                                    },
                                    {
                                        id: 6,
                                        name: 'Targaryen',
                                        open: true,
                                        children: [
                                            {
                                                id: 7,
                                                name: 'Daenerys Targaryen',
                                                events: []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: 7,
                                name: 'Big Bang Theory',
                                open: true,
                                children: [
                                    {
                                        id: 8,
                                        name: 'Sheldon Cooper'
                                    },
                                    {
                                        id: 9,
                                        name: 'Howard Wolowitz'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 10,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 11,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 12,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 13,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 14,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 15,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 16,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 17,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 18,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 19,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 20,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 21,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 22,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 23,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 24,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 25,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 26,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 27,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 28,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 29,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 30,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 31,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 32,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 33,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 34,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 35,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 36,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 37,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 38,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 39,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 40,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 41,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 42,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 43,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 44,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 45,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 46,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 47,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 48,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 49,
                                name: 'Han Solo'
                            }
                        ]
                    },
                    {
                        id: 50,
                        name: 'Movies',
                        open: false,
                        children: [
                            {
                                id: 51,
                                name: 'Han Solo'
                            }
                        ]
                    }
                ];
            }, 1000);
        };
        vm.getResourcesAsync();

        var events = {
            4: [
                {
                    id: 123,
                    startsAt: moment().toDate(),
                    endsAt: moment().add(7, 'days').toDate(),
                    color: 'yellow',
                    pending: false,
                    morningIncluded: true,
                    afternoonIncluded: false,
                    priority: 1
                },
                {
                    id: 456,
                    startsAt: moment().add(2, 'days').toDate(),
                    endsAt: moment().add(5, 'days').toDate(),
                    color: 'red',
                    pending: true,
                    morningIncluded: true,
                    afternoonIncluded: false,
                    priority: 1
                }

            ],
            5: [
                {
                    id: 789,
                    startsAt: moment().toDate(),
                    endsAt: moment().add(7, 'days').toDate(),
                    color: 'pink',
                    pending: false,
                    morningIncluded: true,
                    afternoonIncluded: true,
                    priority: 1
                }
            ]
        };
        vm.getEvents = function () {
            var eventsPromise = $q.defer();

            $timeout(function () {
                eventsPromise.resolve(events);
            }, 1000);

            return eventsPromise.promise;
        };

        vm.getEventsResource = function (minDate, maxDate, resourceId) {
            var eventsPromise = $q.defer();

            $timeout(function () {
                events[resourceId][0].startsAt = moment(events[resourceId][0].startsAt).add(10, 'days').toDate();
                events[resourceId][0].endsAt = moment(events[resourceId][0].endsAt).add(10, 'days').toDate();
                events[resourceId][0].color = 'purple';
                eventsPromise.resolve(events[resourceId]);
            }, 2000);

            return eventsPromise.promise;
        };
    });
