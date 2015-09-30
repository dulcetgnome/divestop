// Controller for the add site form

angular.module('divestop.addsite', [])
  .controller('AddSiteController', function(SharedProperties, DiveSites, Photos) {
    this.site = {};
    this.site.features = [];
    this.site.aquaticLife = [];
    this.site.photos = [];
    this.site.coordinates = SharedProperties.newSite;
    this.showForm = SharedProperties.showForm;

    this.templateUrl = 'add/add.html';

    var addToArray = function(item, array) {
      if(array.indexOf(item) === -1 && !isBlank(item)){
        array.push(item);
      }
    };

    this.addFeature = function() {
      addToArray(this.newFeature, this.site.features);
      this.newFeature = '';
    };
    this.removeFeature = function(index) {
      this.site.features.splice(index, 1);
    };
    this.addAquaticLife = function() {
      addToArray(this.newAquaticLife, this.site.aquaticLife);
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
      }.bind(this));
    };

    this.removePhoto = function(index) {
      this.site.photos.splice(index, 1);
    };

    this.addPhoto = function() {
      form.filePath = '';
      Photos.uploadPhoto(this.newPhoto, function(url){
        this.site.photos.push(url);
      }.bind(this));
    };

    var deepCopy = function(obj) {
      return JSON.parse(JSON.stringify(obj));
    };

    var isBlank = function(string) {
      return string.trim() === '';
    };

  })
  .directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    };
  }]).directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  });
