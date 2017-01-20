angular
    .module('app')
    .controller('AppController', function ($scope, moment, $q, $timeout, $log) {
        var vm = this;
        moment.locale('fr');

        vm.currentDate = moment();
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
                    }
                ];
            }, 1000);
        };
        vm.getResourcesAsync();

        var events = {
            4: [
                {
                    id: 123,
                    startsAt: moment(),
                    endsAt: moment().add(7, 'days'),
                    color: 'yellow',
                    pending: false,
                    morningIncluded: true,
                    afternoonIncluded: false,
                    priority: 1
                },
                {
                    id: 123,
                    startsAt: moment().add(2, 'days'),
                    endsAt: moment().add(5, 'days'),
                    color: 'red',
                    pending: false,
                    morningIncluded: true,
                    afternoonIncluded: false,
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
    });
