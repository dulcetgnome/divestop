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
      // sends a request to get divesites around a certain location (based on long and lat)
      var coords = [SharedProperties.map.center.J, SharedProperties.map.center.M]
      var coordinates = coords[0] + "-" + coords[1];
      DiveSites.getDiveSites(coordinates)
        .then(function(sites) {
          if(sites.length > 0) {
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
                types: ['dive bar']
              }, callback);

            function callback(results, status) {
              if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                  console.log(results[i]);
                }
              }
            }
          }
        }) 
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
