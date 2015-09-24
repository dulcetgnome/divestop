angular.module('divestop', ['uiGmapgoogle-maps'])
  .controller("MapController", function($scope) {
    $scope.map = {
      center: {latitude: site.location[0],
              longitude: site.location[1]
      },
      zoom: 8
    }
  });

var site = {
  name: "Akase",
  location: [33.688895, 130.295930],
  maxDepth: 12,
  description: "A lovely cove that is perfect for beginner divers./
    It starts out shallow with pool like conditions good for training, /
    and then allows for divers to swim out and enjoy a relaxed dive",
  aquaticLife: ["fish"],
  features: ['coral', 'shallow', 'calm'],
  pictures: ['url1', 'url2']
}