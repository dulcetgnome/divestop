angular.module('divestop', ['ngMap'])
  .controller("OurMapController", function($scope) {
    $scope.ourmap = {
      name: "Akase Beach",
      center: site.location,
      zoom: 8
    };

    $scope.showCustomMarker = function() {
      debugger;
      $scope.map.customMarkers.foo.setVisible(true);
    };

    $scope.closeCustomMarker = function() {
      $scope.map.customMarkers.foo.setVisible(false);
    };
  });

var site = {
  name: "Akase",
  location: '33.688895, 130.295930',
  maxDepth: 12,
  description: "A lovely cove that is perfect for beginner divers.\
    It starts out shallow with pool like conditions good for training, \
    and then allows for divers to swim out and enjoy a relaxed dive",
  aquaticLife: ["fish"],
  features: ['coral', 'shallow', 'calm'],
  pictures: ['url1', 'url2']
}