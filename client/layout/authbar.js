angular.module('divestop.authbar', [])
  .controller('AuthbarCtrl', function($scope, $auth) {
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
  });