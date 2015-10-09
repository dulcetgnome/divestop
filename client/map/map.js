// this controller handles the functionality of working with the map

angular.module('divestop.map', ['ngMap'])
  // the controller is called OurMapController so it doesn't interfere with the ngMap MapController
  .controller("OurMapController", function($scope, SharedProperties, DiveSites, AppMap) {
    $scope.newSite = SharedProperties.newSite; // Object with properties lat, lng
    $scope.showForm = SharedProperties.showForm;
    $scope.moveNewMarker = AppMap.moveNewMarker;
    SharedProperties.newSiteMarker = new google.maps.Marker();

    $scope.$on("mapInitialized", function(e, map) {
      SharedProperties.map = map;
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': SharedProperties.location}, function(results, status) {
        console.log("results", results);
        if (status === google.maps.GeocoderStatus.OK) {
          SharedProperties.map.setCenter(results[0].geometry.location);
          SharedProperties.map.setZoom(11);
          $scope.$apply();
        } else {
          console.log('Geocode was not successful for the following reason: ' + status);
        }
      });
      // sends a request to get divesites around a certain location (based on long and lat)
      var coordinates = SharedProperties.map.center.J + "-" + SharedProperties.map.center.M;
      DiveSites.getDiveSites(coordinates)
        .then(function(sites) {
          console.log(sites);
          AppMap.addMarkers(sites, map);
        });
    });

    // $scope.templateUrl = 'map/map.html';

    $scope.toggleForm = function() {
      $scope.showForm.state = !$scope.showForm.state;
      if($scope.showForm.state) {
        AppMap.showNewMarker();
      } else {
        AppMap.hideNewMarker();
      }
    };
});
