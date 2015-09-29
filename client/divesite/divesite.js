// this module controlls the popup divesite information that appears below the map when you click on a map marker

angular.module('divestop.divesite', [])
  .controller('DiveSiteController', function($scope, SharedProperties) {
    $scope.currentSite = SharedProperties.currentSite;
    $scope.showForm = SharedProperties.showForm;

    $scope.templateUrl = 'divesite/divesite.html';
    // This is called by ng-show in the HTML to indicate that a marker for a divesite has actually been selected.
    // It then gives the information to the view to display the information for that specific dive site.
    $scope.isSiteAvailable = function() {
      return $scope.currentSite.site.hasOwnProperty('name');
    };
  });