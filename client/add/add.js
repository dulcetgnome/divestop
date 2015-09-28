angular.module('divestop.addsite', [])
  .controller('AddSiteController', function($scope, SharedProperties, DiveSites) {
    $scope.newSite = SharedProperties.newSite; // Object with properties lat, lng

    $scope.templateUrl = 'add/add.html';

    $scope.addSite = function() {
      DiveSites.postNewSite($scope.newSite).then(function(data){

      });
    };

  });