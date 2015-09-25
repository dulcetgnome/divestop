// controller for the search functionality of the page

angular.module('divesite.search', [])
  .controller('SearchController', function($scope, SharedProperties) {
    $scope.templateUrl = 'search/search.html';

    // var geocoder = new google.maps.Geocoder();

    // function geocodeAddress() {
    //   var address = $scope.searchBoxText;
    //   geocoder.geocode({'address': address}, function(results, status) {
    //     if (status === google.maps.GeocoderStatus.OK) {
    //       $scope.map.setCenter(results[0].geometry.location);
    //       console.log('in geocodeAddress');
    //     } else {
    //       alert('Geocode was not successful for the following reason: ' + status);
    //     }
    //   });
    // }

    // $scope.centerMap = function() {

    // };
  });