// controller for the search functionality of the page

angular.module('divestop.search', [])
  .controller('SearchController', function($scope, SharedProperties) {
    $scope.templateUrl = 'search/search.html';

    var geocoder = new google.maps.Geocoder();

    $scope.geocodeAddress = function(address) {
      // var address = $scope.searchBoxText;
      geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          SharedProperties.map.setCenter(results[0].geometry.location);
        } else {
          console.log('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  });