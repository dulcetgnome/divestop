// these are the services for the app.

angular.module('divestop.services', [])
  .factory('SharedProperties', function() {
    var sharedProperties = {};

    sharedProperties.newSite = {coordinates: {}};
    sharedProperties.showForm = {state: false};
    sharedProperties.map = {};
    sharedProperties.location = '';
    sharedProperties.markers = [];
    sharedProperties.currentSite = {site: {}};
    // sharedProperties.splash = {state: true};

    return sharedProperties;

  })
  .factory('DiveSites', function($http) {

    // should be refactored to take queries -- Edgar
    // should not get every site available in the database -- Edgar
    var getAllDiveSites = function() {
      return $http.get('/api/sites')
        .then(function(resp) {
          return resp.data;
        }, function(err) {
          throw err;
        });
    };
    // gets dive sites around the center coordinates (lat,lng) of the map
    var getDiveSites = function(coordinates) {
      return $http.get('/api/sites/' + coordinates)
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
      getDiveSites: getDiveSites,
      postNewSite: postNewSite
    };
  })
  .factory('Photos', function($http) {
    var resizeImage = function (file, height, callback) {
      // Takes an uploaded file, resizes it based on height and calls the callback sending it a Blob
      var img = new Image();
      var reader = new FileReader();

      img.onload = function() {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        
        canvas.height = height;
        canvas.width = canvas.height * (img.width / img.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.canvas.toBlob(callback);
      };

      reader.onload = function (e) {
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    };

    var getPhotoAPIKeys = function(){
      return $http.get('/api/keys')
        .then(function(resp) {
          return resp.data;
        });
    };

    var uploadPhoto = function(file, callback) {
      // takes a File after upload, resizes it and uploads it to Parse.
      // Sends Url of upload to callback function
      var resizedFileHeight = 300;
      resizeImage(file, resizedFileHeight, function(fileBlob) {
        var serverUrl = 'https://api.parse.com/1/files/' + file.name;

        getPhotoAPIKeys().then(function(keys) {
          $http.post(serverUrl, fileBlob, {
            headers: {
              'X-Parse-Application-Id': keys['X-Parse-Application-Id'],
              'X-Parse-REST-API-Key': keys['X-Parse-REST-API-Key'],
              'Content-Type': file.type
            }
          }).then(function(resp) {
            callback(resp.data.url);
          });
        });
      });
    };

    return {
      uploadPhoto: uploadPhoto
    };

  })
  .factory("AppMap", ['SharedProperties', '$rootScope', 'DiveSites', '$http',
    function(SharedProperties, $rootScope, DiveSites, $http) {
    var getMap = function (map, custom) {
      // make geocoder variable
      var geocoder = new google.maps.Geocoder();
      // set map variable on sharedprops
      SharedProperties.map = map;
      address = SharedProperties.location;
      // sends a request to get divesites around a certain location (based on long and lat)
        geocoder.geocode({'address': address}, function(results, status) {
          var center = {};
          if (status === google.maps.GeocoderStatus.OK) {
            // location is either a dragged location or the address supplies by the user
            center = custom || results[0].geometry.location;
            SharedProperties.map.setCenter(center);
            SharedProperties.map.setZoom(14);
            // will search for divebars (In our db OR google places API)
            getDiveBars();
          } else {
            console.log('Geocode was not successful for the following reason: ' + status);
          }
        });
    };

    var getDiveBars = function () {
      var coords = [SharedProperties.map.center.J, SharedProperties.map.center.M];
      var coordinates = coords[0] + '_' + coords[1];
      DiveSites.getDiveSites(coordinates)
        .then(function(sites) {
          if(sites.length > 0) {
            console.log('found some divebars in db');
            addMarkers(sites, SharedProperties.map);
            // callback(sites);
          }
          else {
            console.log('no divebars in db so we make google places API call.');
            // make API request to google places
            getGooglePlaces(coords);
          }
        }); 
    };
    // this will add markers to the google map object, then store them in a markers array.
    var getGooglePlaces = function(coords) {
        var center = {lat: coords[0], lng: coords[1]};
        var service = new google.maps.places.PlacesService(SharedProperties.map);
          service.nearbySearch({
            location: center,
            radius: 500,
            types: ['cafe', 'bar'],
            keyword:['dive']
          }, callback);

        function callback(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              addMarkers(results, SharedProperties.map);
              savePlaces(results);
            }
          }
        };
    var savePlaces = function (places) {
      console.log('places');
      console.log(places);
      return $http.post('/api/sites', JSON.stringify(places))
        .then(function(resp) {
          return resp.data;
          // put marker on map? 
        }, function(err) {
          throw err;
        });
      // logic for posting places to db goes here
    };


    var addMarkers = function(sites, map){
      // iterate over all markers, and add a Marker object to the map.
      for (var i = 0; i < sites.length; i++) {
        var site = sites[i];
        addMarker(site, map);
      }
    };
    var addMarker = function(site, map) {
      console.log(site);
      console.log(parseInt(site.lat));
      var loc = {J: parseInt(site.lat), M: parseInt(site.long)}
      var marker = new google.maps.Marker({
          position: loc,
          map: map,
          title: site.site,
          // store the site object in the marker to make it easier to access when clicking on the marker.
          diveSite: site
        });
        marker.addListener('click', function(){
          // show the site view, and change views when you click on a different marker.
          SharedProperties.currentSite.site = this.diveSite;
          $rootScope.$apply();
        });
        SharedProperties.markers.push(marker);
    };

    var hideNewMarker = function() {
      SharedProperties.newSiteMarker.setMap(null);
    };

    var showNewMarker = function() {
      SharedProperties.newSiteMarker.setMap(SharedProperties.map);
    };

    var moveNewMarker = function(event) {
      var ll = event.latLng;
      SharedProperties.newSite.lat = ll.lat();
      SharedProperties.newSite.lng = ll.lng();
      SharedProperties.newSiteMarker.setPosition({
        lat: ll.lat(),
        lng: ll.lng()
      });
    };

    return {
      getMap: getMap,
      getDiveBars: getDiveBars,
      getGooglePlaces: getGooglePlaces,
      addMarkers: addMarkers,
      addMarker: addMarker,
      hideNewMarker: hideNewMarker,
      showNewMarker: showNewMarker,
      moveNewMarker: moveNewMarker
    };
  }])
  .factory('Account', function($http) {
    return {
      getProfile: function() {
        return $http.get('/api/me');
      },
      updateProfile: function(profileData) {
        return $http.put('/api/me', profileData);
      }
    };
  });
