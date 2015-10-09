// controller for the search functionality of the page

angular.module('divestop.search', [])
  .controller('SearchController', function($scope, $location, SharedProperties, DiveSites, AppMap) {

    $scope.data = {};
    // geocoder querys the google map api to get lat lng coordinates for an address
    // $scope.data.address = '';
    $scope.geocodeAddress = function(address) {
      // $scope.$on("mapInitialized", function(e, map) {
        SharedProperties.location = address;
          console.log('jooo');
          
        // sends a request to get divesites around a certain location (based on long and lat)
        // });
        $scope.data.address = '';
        $location.path('/map');
    };
  });
