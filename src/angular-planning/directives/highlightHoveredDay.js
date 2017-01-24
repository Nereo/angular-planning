'use strict';

angular.module('angularPlanningApp')

.directive('highlightHoveredDay', function () {
    function getElementById(id) {
        /* eslint angular/document-service: 0 */
        return angular.element(document.querySelector(id));
    }

    return function (scope, element, attr) {
        element.on('mouseenter', function () {
            getElementById('#day-number-' + attr.highlightHoveredDay).addClass('planning-day-hovered-cell');
            getElementById('#day-weekdayname-' + attr.highlightHoveredDay).addClass('planning-day-hovered-cell');
        });

        element.on('mouseleave', function () {
            getElementById('#day-number-' + attr.highlightHoveredDay).removeClass('planning-day-hovered-cell');
            getElementById('#day-weekdayname-' + attr.highlightHoveredDay).removeClass('planning-day-hovered-cell');
        });
    };
});
