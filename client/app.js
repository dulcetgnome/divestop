angular.module('divestop', ['ngMap'])
  .controller("OurMapController", function($scope) {
    console.log(sites[0]);
    $scope.showSiteInfo = false;
    $scope.currentSite = sites[0];
      // {name: "",
      // maxDepth: undefined,
      // description: "",
      // aquaticLife: [],
      // features: [],
      // pictures: []
    // }
    $scope.$on("mapInitialized", function(e, map) {
      addMarkers(sites, map);
    })

    var addMarkers = function(sites, map){
      for (var i = 0; i < sites.length; i++) {
        var site = sites[i];
        var marker = new google.maps.Marker({
          position: site.coordinates,
          map: map,
          title: site.name,
          diveSite: site
        })
        marker.addListener('click', function(){
          debugger;
          // if siteInfo view
            // remove view
          // create new view with clicked info
          $scope.showSiteInfo = true;
          $scope.currentSite.name = this.diveSite.name;
          $scope.currentSite.description = this.diveSite.description;
          $scope.currentSite.aquaticLife = this.diveSite.aquaticLife;
          $scope.currentSite.maxDepth = this.diveSite.maxDepth;
          $scope.currentSite.pictures = this.diveSite.pictures;
          $scope.$apply();
          console.log(this)}
        );
      }

      var geocoder = new google.maps.Geocoder();

      function geocodeAddress() {
        var address = $scope.searchBoxText;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            $scope.map.setCenter(results[0].geometry.location);
            console.log('in geocodeAddress');
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }
    };

    $scope.centerMap = function() {

    };
  });


var sites = [{
  name: "Akase",
  coordinates: {lat:33.688895, lng:130.295930},
  maxDepth: 12,
  description: "A lovely cove that is perfect for beginner divers.\
    It starts out shallow with pool like conditions good for training, \
    and then allows for divers to swim out and enjoy a relaxed dive",
  aquaticLife: ["fish"],
  features: ['coral', 'shallow', 'calm'],
  pictures: ['url1', 'url2']
},
{
  name: "Shirose",
  coordinates: {lat:33.686958, lng:130.305055},
  maxDepth: 12,
  description: "A lovely cove that is perfect for beginner divers.\
    It starts out shallow with pool like conditions good for training, \
    and then allows for divers to swim out and enjoy a relaxed dive",
  aquaticLife: ["fish"],
  features: ['coral', 'shallow', 'calm'],
  pictures: ['url1', 'url2']
},
{
  name: "Kurose",
  coordinates: {lat:33.689244, lng:130.300034},
  maxDepth: 12,
  description: "A lovely cove that is perfect for beginner divers.\
    It starts out shallow with pool like conditions good for training, \
    and then allows for divers to swim out and enjoy a relaxed dive",
  aquaticLife: ["fish"],
  features: ['coral', 'shallow', 'calm'],
  pictures: ['url1', 'url2']
},
{
  name: "Osaki",
  coordinates: {lat:33.680887, lng:130.286001},
  maxDepth: 12,
  description: "A lovely cove that is perfect for beginner divers.\
    It starts out shallow with pool like conditions good for training, \
    and then allows for divers to swim out and enjoy a relaxed dive",
  aquaticLife: ["fish"],
  features: ['coral', 'shallow', 'calm'],
  pictures: ['url1', 'url2']
}]