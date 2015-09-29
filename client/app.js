// This is the overall angular model that controls the different parts of the site,
// the logic for each part is kept in it's specific controller.

angular.module('divestop', [
  'divestop.map',
  'divestop.divesite',
  'divestop.services',
  'divestop.search',
  'divestop.addsite'
]);
