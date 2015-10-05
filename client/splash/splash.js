// controller for the splash functionality of the page

angular.module('divestop.splash', [])
  .controller('SplashController', function($scope, SharedProperties) {
    $scope.splash = SharedProperties.splash;
  });