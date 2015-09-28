// these are the services for the app.

angular.module('divestop.services', [])
  .factory('SharedProperties', function() {
    var sharedProperties = {};

    

    
    sharedProperties.currentSite = {site: {}};

    return sharedProperties;

  })
  .factory('DiveSites', function() {

    var diveSites = {};

    var getAllDiveSites = function(callback) {
      $http.get('/sites')
        .then(function(data) {
          callback(data);
        }, function(err) {
          throw err;
        })
    };

    var postNewSite = function(site, callback) {
      // site is a JSON object with information about the divesite in the following format:
      // {
      //   name: String,
      //   coordinates: {lat:Number, lng:Number},
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
      //   coordinates: {lat:33.688895, lng:130.295930},
      //   maxDepth: 12,
      //   description: "A lovely cove that is perfect for beginner divers.\
      //     It starts out shallow with pool like conditions good for training, \
      //     and then allows for divers to swim out and enjoy a relaxed dive",
      //   aquaticLife: ["fish"],
      //   features: ['coral', 'shallow', 'calm'],
      //   pictures: ['url1', 'url2']
      // }
      $http.post('/sites', site)
        .then(function() {
          // put marker on map? 
        }, function(err) {
          throw err;
        })
    };
    
    diveSites.getAllDiveSites = getAllDiveSits;
    diveSites.postNewSite = postNewSite;

    return diveSites;
  });