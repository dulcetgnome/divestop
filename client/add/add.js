angular.module('divestop.addsite', [])
  .controller('AddSiteController', function($scope, SharedProperties, DiveSites) {
    $scope.site = {};
    $scope.site.coordinates = SharedProperties.newSite;
    $scope.showForm = SharedProperties.showForm;

    $scope.templateUrl = 'add/add.html';

    $scope.addSite = function() {
      DiveSites.postNewSite($scope.site).then(function(data){

      });
    };
  });