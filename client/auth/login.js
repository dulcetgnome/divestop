angular.module('divestop.login', [])
  .controller('LoginCtrl', function($scope, $location, $auth, toastr) {
    $scope.login = function () {
      $auth.login($scope.user)
        .then(function () {
          toastr.success("You have successfully signed in");
          $location.pth('/');
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        }); 
    };
    $scope.authenticate = function(provider) {
      $auth.authenticate(pr
        .then(function () {
          toastr.success('You have successfully signed in with ' + provider);
          $location.path('/');
        })
        .catch(function(response) {
          toastr.error(response.data.message);
        });
    };
  });