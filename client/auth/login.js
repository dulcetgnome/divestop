angular.module('divestop.login', [])
  .controller('LoginCtrl', function($scope, $location, $auth, $route, $window) {
    // $scope.login = function () {
    //   $auth.login($scope.user)
    //     .then(function () {
    //       // toastr.success("You have successfully signed in");
    //       $location.pth('/');
    //     })
    //     .catch(function(response) {
    //       // toastr.error(response.data.message, response.status);
    //     }); 
    // };
    $scope.reloadRoute = function (callback) {
      $window.location.reload();
      callback();
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function () {
          // toastr.success('You have successfully signed in with ' + provider);
          $scope.reloadRoute(function () {
            $location.path('/');
          });
        })
        .catch(function(response) {
          // toastr.error(response.data.message);
        });
    };
  });