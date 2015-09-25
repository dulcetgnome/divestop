// these are the services for the app.

angular.module('divestop.services', [])
  .factory('SharedProperties', function() {
    var sharedProperties = {};

    sharedProperties.currentSite = {site: {}};

    return sharedProperties;
  });