angular.module("angularPlanningApp").run(["$templateCache", function($templateCache) {$templateCache.put("index.html","<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <title>FountainJS</title>\n    <meta name=\"description\" content=\"\">\n    <meta name=\"viewport\" content=\"width=device-width\">\n    <link rel=\"icon\" type=\"image/png\" href=\"http://fountainjs.io/assets/imgs/fountain.png\">\n  \n    <!-- build:css({.tmp,src}) styles/vendor.css -->\n    <!-- bower:css -->\n    <!-- run `gulp inject` to automatically populate bower styles dependencies -->\n    <!-- endbower -->\n    <!-- endbuild -->\n\n    <!-- build:css({.tmp,src}) styles/app.css -->\n    <link rel=\"stylesheet\" href=\"index.css\">\n    <link rel=\"stylesheet\" href=\"angular-planning/planning.css\">\n    <!-- endbuild -->\n  </head>\n\n\n  <body ng-app=\"app\">\n    <ng-controller ng-controller=\"AppController as vm\">\n      <div class=\"row\">\n          <div class=\"col-sm-3\">\n              <div class=\"btn-group\">\n                  <button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.addDays(-30)\">30 days before</button>\n                  <button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.addDays(-7)\">7 days before</button>\n                  <button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.addDays(7)\">7 days after</button>\n                  <button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.addDays(30)\">30 days after</button>\n                  <button type=\"button\" class=\"btn btn-default\" ng-init=\"showPlanning = true\" ng-click=\"showPlanning = !showPlanning\">Toggle planning</button>\n                  <button type=\"button\" class=\"btn btn-default\" ng-click=\"vm.updateSingleEvent()\">Update single event</button>\n              </div>\n          </div>\n          <div class=\"col-sm-3\">\n              <div class=\"input-group\">\n                  <input type=\"text\" class=\"form-control\" placeholder=\"MM/DD/YYYY\" ng-model=\"vm.goToDateString\">\n                  <span class=\"input-group-btn\">\n                      <button class=\"btn btn-default\" type=\"button\" ng-click=\"vm.goToDate()\">Go to</button>\n                  </span>\n              </div>\n          </div>\n      </div>\n      <div ng-if=\"showPlanning\">\n        <angular-planning current-date=\"vm.currentDate\" resources=\"vm.resources\" update-events=\"vm.updateEvents(minDate, maxDate)\" on-person-click=\"vm.onPersonClick(resource)\" on-day-hover=\"vm.onDayHover(day, resource)\" on-day-click=\"vm.onDayClick(day, resource)\" on-event-click=\"vm.onEventClick(event, day, resource)\" cell-width=\"20\" planning-resources-column-ratio=\"15\" show-day-of-week=\"true\"></angular-planning>\n      </div>\n    </ng-controller>\n  </body>\n\n  <!-- build:js({.tmp,src}) scripts/vendor.js -->\n  <!-- bower:js -->\n  <!-- run `gulp inject` to automatically populate bower script dependencies -->\n  <!-- endbower -->\n  <!-- endbuild -->\n\n  <!-- build:js({.tmp,src}) scripts/app.js -->\n  <!-- inject:js -->\n  <!-- js files will be automatically insert here -->\n  <!-- endinject -->\n  <!-- inject:partials -->\n  <!-- angular templates will be automatically converted in js and inserted here -->\n  <!-- endinject -->\n  <!-- endbuild -->\n</html>\n\n");
$templateCache.put("angular-planning/views/angular-planning.html","<div class=\"planning-wrapper\">\n    <div class=\"planning-loading\" ng-if=\"vm.flattenedResources.length == 0\">\n        <i class=\"fa fa-spin fa-spinner\"></i>\n    </div>\n    <table class=\"planning-table\" resize-detect watched-width=\"planningWidth\">\n        <thead class=\"planning-table-header\">\n            <tr>\n                <th class=\"planning-resources\">&nbsp;</th>\n                <th class=\"planning-month\" viewport-watch ng-repeat=\"month in vm.dates.months track by month.month\" ng-attr-colspan=\"{{ month.nbDaysDisplayed }}\">{{ ::month.monthName }}</th>\n            </tr>\n            <tr>\n                <th class=\"planning-resources\">&nbsp;</th>\n                <th id=\"day-number-{{ day.index }}\" viewport-watch ng-repeat=\"day in vm.dates.days track by day.day\" ng-class=\"{\'planning-today-cell\': day.isToday}\">\n                    {{ ::day.dayNumber }}\n                    <div class=\"planning-end-of-week-bar\" ng-show=\"day.isEndOfWeek\"></div>\n                </th>\n            </tr>\n            <tr ng-if=\"showDayOfWeek\">\n                <th class=\"planning-resources\">&nbsp;</th>\n                <th id=\"day-weekdayname-{{ day.index }}\" viewport-watch ng-repeat=\"day in vm.dates.days track by day.day\" ng-class=\"{\'planning-today-cell\': day.isToday}\">{{ ::day.weekDayName }}</th>\n            </tr>\n        </thead>\n        <tbody>\n            <tr viewport-watch ng-repeat=\"resource in vm.flattenedResources track by (resource.parentGroup + \'-\' + resource.id)\" ng-class=\"{\'planning-group-row\': resource.group}\" ng-if=\"resource.show\" on-click=\"vm.onResourceClick(resource)\">\n                <th class=\"planning-resources\" ng-class=\"{\'planning-group-toggle\': resource.group}\">\n                    <div class=\"planning-resource-name\" ng-class=\"{\'planning-resource-person\': !resource.group}\" ng-style=\"{\'padding-left\': ((resource.depth + 1) * resource.group * 10) + \'px\'}\">\n                        <i class=\"fa\" ng-if=\"resource.group\" ng-class=\"{\'fa-caret-down\': resource.open, \'fa-caret-right\': !resource.open}\"></i>\n                        {{ ::resource.name }}\n                    </div>\n                </th>\n                <td class=\"planning-day-cell\" ng-repeat=\"index in vm.dates.indices track by (resource.id + \'-\' + $index)\" highlight-hovered-day=\"{{ ::index }}\">\n                    <div class=\"planning-day-events\" ng-if=\"!resource.group\" on-mouse-enter=\"vm.onDayHover(index, resource)\" on-click=\"vm.onDayClick(index, resource)\">\n                        <div class=\"planning-day-event\" ng-repeat=\"event in vm.getEventsDay(index, resource.id) track by (resource.id + \'-\' + index + \'-\' + $index)\" ng-style=\"{\n                          background: vm.isMorningOnly(index, event) ? \'linear-gradient(to right bottom, \' + event.color + \' 50%, rgba(255, 255, 255, 0) 50%)\' : (vm.isAfternoonOnly(index, event) ? \'linear-gradient(to right bottom, rgba(255, 255, 255, 0) 50%, \' + event.color + \' 50%)\' : event.color) }\" on-click=\"vm.onEventClick($event, event, index, resource)\">\n                            <i class=\"fa fa-hourglass-half\" ng-if=\"event.pending\"></i>\n                        </div>\n                    </div>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n</div>\n");}]);