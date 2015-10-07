angular.module('divestop.logout', [])
  .controller('LogoutCtrl', function ($location, $auth, toastr) {
    if (!$ath.isAuthenticated()) { return; }
    $auth.logout()
      .then(function () {
        toastr.info('You have been logged out');
        $location.path('/');
      });
  });