angular.module('divestop.barsvisited', [])
  .controller('BarsVisitedCtrl', function($scope, SharedProperties, DiveSites) {
    // Upload bars information.......
    $scope.bars = ['coral', 'shallow', 'calm','coral1', 'shallow1', 'calm1','coral2', 'shallow2', 'calm2','coral3', 'shallow3', 'calm3','coral4', 'shallow4', 'calm4'];
    $scope.showForm = SharedProperties.showForm;

    // $scope.templateUrl = 'divesite/divesite.html';

  });