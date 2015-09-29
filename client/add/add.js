// Controller for the add site form

angular.module('divestop.addsite', [])
  .controller('AddSiteController', function(SharedProperties, DiveSites) {
    this.site = {};
    this.site.features = [];
    this.site.aquaticLife = [];
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
    this.addAquaticLife = function() {
      this.site.aquaticLife.push(this.newAquaticLife);
      this.newAquaticLife = '';
    };
    this.removeAquaticLife = function(index) {
      this.site.aquaticLife.splice(index, 1);
    };

    this.clearForm = function() {
      this.site.name = '';
      this.site.maxDepth = '';
      this.site.description = '';
      this.site.features = [];
      this.site.aquaticLife = [];
      this.site.coordinates.lat = undefined;
      this.site.coordinates.lng = undefined;
    };

    this.addSite = function() {
      // Deep copy the object so we can stringify coordinates before passing to server
      var newSite = deepCopy(this.site);
      newSite.coordinates = JSON.stringify(newSite.coordinates);
      DiveSites.postNewSite(newSite).then(function(data) {
        this.clearForm();
        // call toggleForm on map controller
        // Rerender map with new marker
      });
    };

    var deepCopy = function(obj) {
      return JSON.parse(JSON.stringify(obj));
    };
  });
