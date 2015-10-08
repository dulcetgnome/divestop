// controller for the search functionality of the page

angular.module('divestop.search', [])
  .controller('SearchController', function($scope, $location, SharedProperties) {

    $scope.data = {};
    // geocoder querys the google map api to get lat lng coordinates for an address
    var geocoder = new google.maps.Geocoder();
    // $scope.data.address = '';
    $scope.geocodeAddress = function(address) {
      console.log(SharedProperties.map);
      // console.log(address);
      // Takes in an address (String) and sets map postion
      geocoder.geocode({'address': address}, function(results, status) {
        console.log("results", results);
        if (status === google.maps.GeocoderStatus.OK) {
          SharedProperties.map.setCenter(results[0].geometry.location);
          SharedProperties.map.setZoom(11);
          $scope.$apply();
        } else {
          console.log('Geocode was not successful for the following reason: ' + status);
        }
      });
      $scope.data.address = '';
      $location.path('/');
    };
  });
