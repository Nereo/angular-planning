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
        vm.onPersonClick = function (resource) {
            $log.log('Person clicked', resource);
        };

        vm.resources = [];
        vm.getResourcesAsync = function () {
            $timeout(function () {
                vm.resources = [
                    {
                        id: 1,
                        name: 'TV Series',
                        order: 0,
                        level: 0,
                        tree_id: 1,
                        parent: null,
                        managers: [],
                        members: [],
                        open: false
                    },
                    {
                        id: 11,
                        name: 'Game of Thrones',
                        order: 0,
                        level: 1,
                        tree_id: 1,
                        parent: 1,
                        managers: [],
                        members: [],
                        open: false
                    },
                    {
                        id: 111,
                        name: 'Stark',
                        order: 0,
                        level: 2,
                        tree_id: 1,
                        parent: 11,
                        managers: [],
                        members: [
                            {
                                id: 1,
                                name: 'Jon Snow'
                            },
                            {
                                id: 2,
                                name: 'Sansa Stark'
                            }
                        ],
                        open: true
                    },
                    {
                        id: 112,
                        name: 'Targaryen',
                        order: 1,
                        level: 2,
                        tree_id: 1,
                        parent: 11,
                        managers: [],
                        members: [
                            {
                                id: 3,
                                name: 'Daenerys Targaryen'
                            }
                        ],
                        open: true
                    },
                    {
                        id: 12,
                        name: 'Big Bang Theory',
                        order: 0,
                        level: 1,
                        tree_id: 1,
                        parent: 1,
                        managers: [],
                        members: [
                            {
                                id: 4,
                                name: 'Sheldon Cooper'
                            },
                            {
                                id: 5,
                                name: 'Howard Wolowitz'
                            }
                        ],
                        open: true
                    },
                    {
                        id: 2,
                        name: 'Movies',
                        order: 0,
                        level: 0,
                        tree_id: 2,
                        parent: null,
                        managers: [],
                        members: [
                            {
                                id: 6,
                                name: 'Han Solo'
                            }
                        ],
                        open: false
                    }
                ];
            }, 1000);
        };
        vm.getResourcesAsync();

        vm.events = [
            {
                resourceId: 4,
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
                resourceId: 4,
                id: 456,
                startsAt: moment().add(2, 'days').toDate(),
                endsAt: moment().add(5, 'days').toDate(),
                color: 'red',
                pending: true,
                morningIncluded: true,
                afternoonIncluded: false,
                priority: 1
            },
            {
                resourceId: 5,
                id: 789,
                startsAt: moment().toDate(),
                endsAt: moment().add(7, 'days').toDate(),
                color: 'pink',
                pending: false,
                morningIncluded: true,
                afternoonIncluded: true,
                priority: 1
            }
        ];

        vm.updateEvents = function () {
            return $timeout(
                function () {
                    return vm.events;
                },
                2000
            );
        };

        vm.updateSingleEvent = function () {
            var colors = ['red', 'pink', 'yellow', 'blue', 'crimson', 'darkorange'];
            vm.events[0].color = colors[Math.floor(Math.random() * colors.length)];
            vm.events[0].endsAt = moment(vm.events[0].endsAt).add(1, 'days');
            $scope.$broadcast('updateEvents', vm.events);
        };
    });
