angular.module('divestop.profile', [])
  .controller('ProfileCtrl', function($scope, $auth, toastr, Account) {
   
    // Retrieve the profile information from database
    $scope.getProfile = function () {
      Account.getProfile()
        .then(function(response) {
          $scope.user = response.data;
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };
    $scope.updateProfile = function () {
      Account.updateProfile($scope.user)
        .then(function () {
          toastr.success('Profile has been updated');
        })
        .catch(function(response) {
          toastr.error(reponse.data.message, response.status);
        });
    };
    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function () {
          toastr.info('You have unlinked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
           toastr.error(response.data ? response.data.message : 'Could not unlink ' + provider + ' account', response.status);
        });
    };
    $scope.getProfile();
  });