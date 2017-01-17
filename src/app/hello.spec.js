describe('hello component', function () {
    beforeEach(module('app', function ($provide) {
        $provide.factory('app', function () {
            return {
                templateUrl: 'app/hello.html'
            };
        });
    }));
});
