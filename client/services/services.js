// these are the services for the app.

angular.module('divestop.services', [])
  .factory('SharedProperties', function() {
    var sharedProperties = {};

    sharedProperties.newSite = {coordinates: {}};
    sharedProperties.showForm = {state: false};
    
    sharedProperties.currentSite = {site: {}};

    return sharedProperties;

  })
  .factory('DiveSites', function($http) {

    var getAllDiveSites = function() {
      return $http.get('/api/sites')
        .then(function(resp) {
          return resp.data;
        }, function(err) {
          throw err;
        });
    };

    var postNewSite = function(site) {
      // site is a JSON object with information about the divesite in the following format:
      // {
      //   name: String,
      //   coordinates: String, // In format '{lat:Number, lng:Number}'
      //   maxDepth: Number,
      //   description: String,
      //   aquaticLife: [String, String, ...],
      //   features: [String, String, String, ...],
      //   pictures: [String, String]  -these should be URLs to the pictures.
      // }
      // 
      // Here is an example:
      // {
      //   name: "Akase",
      //   coordinates: "{lat:33.688895, lng:130.295930}",
      //   maxDepth: 12,
      //   description: "A lovely cove that is perfect for beginner divers.\
      //     It starts out shallow with pool like conditions good for training, \
      //     and then allows for divers to swim out and enjoy a relaxed dive",
      //   aquaticLife: ["fish"],
      //   features: ['coral', 'shallow', 'calm'],
      //   pictures: ['url1', 'url2']
      // }
      return $http.post('/api/sites', site)
        .then(function(resp) {
          return resp.data;
          // put marker on map? 
        }, function(err) {
          throw err;
        });
    };

    return {
      getAllDiveSites: getAllDiveSites,
      postNewSite: postNewSite
    };
  });
