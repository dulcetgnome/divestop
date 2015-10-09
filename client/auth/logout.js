angular.module('divestop.logout', [])
  .controller('LogoutCtrl', function ($location, $auth, $scope, $window) {
    $scope.reloadRoute = function (callback) {
      $window.location.reload();
      callback();
    };

    if (!$auth.isAuthenticated()) { return; }
    $auth.logout()
      .then(function () {
        // toastr.info('You have been logged out');
        $scope.reloadRoute(function () {
          $location.path('/');
        });
      });
  });