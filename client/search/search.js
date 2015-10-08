// controller for the search functionality of the page

angular.module('divestop.search', [])
  .controller('SearchController', function($scope, $location, SharedProperties, DiveSites) {

    $scope.data = {};
    // geocoder querys the google map api to get lat lng coordinates for an address
    var geocoder = new google.maps.Geocoder();
    // $scope.data.address = '';
    $scope.geocodeAddress = function(address) {
      map = SharedProperties.map;
      // console.log(address);
      // Takes in an address (String) and sets map postion
      geocoder.geocode({'address': address}, function(results, status) {
        console.log("results", results);
        if (status === google.maps.GeocoderStatus.OK) {
          SharedProperties.map.setCenter(results[0].geometry.location);
          SharedProperties.map.setZoom(11);
          $scope.$apply();

          var coords = [SharedProperties.map.center.J, SharedProperties.map.center.M]
          var coordinates = coords[0] + "-" + coords[1];
          DiveSites.getDiveSites(coordinates)
            .then(function(sites) {
              if(sites.length > 0) {
                console.log('found some divebars in db');
                AppMap.addMarkers(sites, map);
              }
              else {
                console.log('no divebars in db so else statement was fired.');
                // make API request to google places
                var center = {lat: coords[0], lng: coords[1]};
                var service = new google.maps.places.PlacesService(map);
                  service.nearbySearch({
                    location: center,
                    radius: 500,
                    types: ['bar']
                  }, callback);

                function callback(results, status) {
                  if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                      console.log(results[i]);
                    }
                  }
                }
              }
            }); 
        } else {
          console.log('Geocode was not successful for the following reason: ' + status);
        }
      });
      $scope.data.address = '';
      $location.path('/');
    };
  });
