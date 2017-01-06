'use strict';

/**
 * @ngdoc function
 * @name angularPlanningApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularPlanningApp
 */
angular.module('angularPlanningApp')

.controller('MainCtrl', function ($scope, $q, $location, $anchorScroll, moment) {
    $scope.currentDate = moment();
    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
    };

    $scope.onDayHover = function(day, resource) {
        console.log('Day hovered', day, resource);
    };
    $scope.onDayClick = function(day, resource) {
        console.log('Day clicked', day, resource);
    };
    $scope.onEventClick = function(event, day, resource) {
        console.log('Event clicked', event, day, resource);
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
                                },
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
                                },
                            ]
                        },
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
    $scope.getResources = function() {
        var resourcesPromise = $q.defer();

        setTimeout(function() {
            resourcesPromise.resolve(resources);
        }, 1000);

        return resourcesPromise.promise;
    };
});
