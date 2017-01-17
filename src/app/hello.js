angular
    .module('app')
    .controller('AppController', function ($scope, moment, $q, $timeout, $log) {
        var vm = this;

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
        var resources = [
            {
                id: 1,
                name: 'TV Series',
                open: true,
                childs: [
                    {
                        id: 2,
                        name: 'Game of Thrones',
                        open: true,
                        childs: [
                            {
                                id: 3,
                                name: 'Stark',
                                open: true,
                                childs: [
                                    {
                                        id: 4,
                                        name: 'Jon Snow',
                                        events: [
                                            {
                                                id: 123,
                                                startsAt: moment(),
                                                endsAt: moment().add(4, 'days'),
                                                color: 'yellow',
                                                pending: true,
                                                morningIncluded: false,
                                                afternoonIncluded: false,
                                                priority: 1
                                            }
                                        ]
                                    },
                                    {
                                        id: 5,
                                        name: 'Sansa Stark',
                                        events: [
                                            {
                                                id: 123,
                                                startsAt: moment().add(10, 'days'),
                                                endsAt: moment().add(12, 'days'),
                                                color: 'purple',
                                                pending: false,
                                                morningIncluded: true,
                                                afternoonIncluded: true,
                                                priority: 1
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: 6,
                                name: 'Targaryen',
                                open: true,
                                childs: [
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
                        childs: [
                            {
                                id: 8,
                                name: 'Sheldon Cooper',
                                events: [
                                    {
                                        id: 123,
                                        startsAt: moment().add(1, 'months'),
                                        endsAt: moment().add(1, 'months').add(4, 'days'),
                                        color: 'pink',
                                        pending: false,
                                        morningIncluded: true,
                                        afternoonIncluded: true,
                                        priority: 1
                                    }
                                ]
                            },
                            {
                                id: 9,
                                name: 'Howard Wolowitz',
                                events: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 10,
                name: 'Movies',
                open: false,
                childs: [
                    {
                        id: 11,
                        name: 'Han Solo',
                        events: []
                    }
                ]
            }
        ];
        vm.getResources = function () {
            var resourcesPromise = $q.defer();

            $timeout(function () {
                resourcesPromise.resolve(resources);
            }, 1000);

            return resourcesPromise.promise;
        };
    });
