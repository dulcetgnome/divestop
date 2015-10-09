// controller for the splash page functionality

angular.module('divestop.splash', [])
  .controller('SplashController', function($scope, SharedProperties) {
    $scope.splash = SharedProperties.splash;
  });
