angular.module('divestop', ['ngMap'])
  .controller("OurMapController", function($scope) {
    console.log(sites[0]);
    $scope.showSiteInfo = false;
    $scope.currentSite = {};
    $scope.$on("mapInitialized", function(e, map) {
      addMarkers(sites, map);
    })

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
          $scope.showSiteInfo = true;
          $scope.currentSite = this.diveSite;

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
