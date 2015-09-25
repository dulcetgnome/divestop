// this module controlls the popup divesite information that appears below the map when you click on a map marker

angular.module('divestop.divesite', [])
  .controller('DiveSiteController', function($scope, SharedProperties) {
    $scope.currentSite = SharedProperties.currentSite;

    $scope.isSiteAvailable = function() {
      console.log("checking if site is available");
      console.log("currentSite: ", $scope.currentSite);
      console.log("Shared current site: ", SharedProperties.currentSite);
      return !($scope.currentSite.hasOwnProperty('name'));
    };
  });