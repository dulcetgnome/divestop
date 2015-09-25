// this controller handles the functionality of working with the map

angular.module('divestop.map', ['ngMap'])
  .controller("OurMapController", function($scope, SharedProperties) {
    
    $scope.$on("mapInitialized", function(e, map) {
      addMarkers(sites, map);
    })

    // this will add markers to the google map object, and doesn't keep them around in memeory in an easily accessible way.
    var addMarkers = function(sites, map){
      // iterate over all markers, and add a Marker object to the map.
      for (var i = 0; i < sites.length; i++) {
        var site = sites[i];
        var marker = new google.maps.Marker({
          position: site.coordinates,
          map: map,
          title: site.name,
          // store the site object in the marker to make it easier to access when clicking on the marker.
          diveSite: site
        })
        marker.addListener('click', function(){
          // show the site view, and change views when you click on a different marker.
          SharedProperties.currentSite.site = this.diveSite;

          $scope.$apply();
        });
      }

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
    };

    $scope.centerMap = function() {

    };
  });