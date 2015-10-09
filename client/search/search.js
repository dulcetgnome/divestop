// controller for the search functionality of the page

angular.module('divestop.search', [])
  .controller('SearchController', function($scope, $location, SharedProperties, DiveSites, AppMap) {
    $scope.data = {};
    $scope.geocodeAddress = function(address) {
        // set long and lat coords on sharedproperties object 
        SharedProperties.location = address;
        $scope.data.address = '';
        // redirect to map (search query will be handled in map.js)
        $location.path('/map');
    };
  });
