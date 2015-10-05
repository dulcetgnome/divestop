// these are the services for the app.

angular.module('divestop.services', [])
  .factory('SharedProperties', function() {
    var sharedProperties = {};

    sharedProperties.newSite = {coordinates: {}};
    sharedProperties.showForm = {state: false};
    sharedProperties.markers = [];
    
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
  .factory("AppMap", ['SharedProperties', 
    function(SharedProperties) {

    // this will add markers to the google map object, then store them in a markers array.
    var addMarkers = function(sites, map){
      // iterate over all markers, and add a Marker object to the map.
      for (var i = 0; i < sites.length; i++) {
        var site = sites[i];
        addMarker(site, map);
      }
    };


    var addMarker = function(site, map) {
      var marker = new google.maps.Marker({
          position: site.coordinates,
          map: map,
          title: site.name,
          // store the site object in the marker to make it easier to access when clicking on the marker.
          diveSite: site
        });
        marker.addListener('click', function(){
          // show the site view, and change views when you click on a different marker.
          SharedProperties.currentSite.site = this.diveSite;
          // $scope.hideForm();

          // $scope.$apply();
        });
        SharedProperties.markers.push(marker);
    }

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
      addMarkers: addMarkers,
      addMarker: addMarker,
      hideNewMarker: hideNewMarker,
      showNewMarker: showNewMarker,
      moveNewMarker: moveNewMarker
    }
  }]);
