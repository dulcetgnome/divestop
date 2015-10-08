// This is the overall angular model that controls the different parts of the site,
// the logic for each part is kept in it's specific controller.

angular.module('divestop', [
  'divestop.map',
  'divestop.divesite',
  // 'divestop.users',
  'divestop.services',
  'divestop.search',
  'divestop.splash',
  'divestop.addsite',
  'divestop.login',
  'divestop.logout',
  'ngRoute',
  'satellizer'
])

.config(function ($routeProvider, $httpProvider, $authProvider) {
  $routeProvider

    .when('/', {
      templateUrl: '/welcome/welcome.html',
      controller: 'SearchController'
    })
    // We don't need signup at the moment - maybe later functionality
    // .when('/signup', {
    //   templateUrl: '/users/signup.html',
    //   controller: 'userController'
    // })
    .when('/map', {
      templateUrl: '/map/map.html',
      controller: 'OurMapController'
    })
    .when('/login', {
      templateUrl: '/users/login.html',
      controller: 'LoginCtrl'
    })
    .when('/profile', {
      templateUrl: '/users/profile.html',
      controller: 'ProfileCtrl'
    })
    .when('/settings', {
      templateUrl: '/users/settings.html',
      controller: 'userController'
    })
    .when('/bars', {
      templateUrl: '/divesite/divesite.html',
      controller: 'DiveSiteController'
    })
    .when('/bars/new', {
      templateUrl: '/add/add.html',
      controller: 'AddSiteController'
    })
    .otherwise("/");

  // use satellizer for user authentication
  $authProvider.facebook({
    clientId: '898772140217593'
  });
});

