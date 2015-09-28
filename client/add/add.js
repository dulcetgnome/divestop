angular.module('divestop.addsite', [])
  .controller('AddSiteController', function(SharedProperties, DiveSites) {
    this.site = {};
    this.site.features = [];
    this.site.coordinates = SharedProperties.newSite;
    this.showForm = SharedProperties.showForm;

    this.templateUrl = 'add/add.html';

    this.addFeature = function() {
      this.site.features.push(this.newFeature);
      this.newFeature = '';
    };
    this.removeFeature = function(index) {
      this.site.features.splice(index, 1);
    };

    this.addSite = function() {
      DiveSites.postNewSite(this.site).then(function(data){

      });
    };
  });