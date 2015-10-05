// Controller for the add site form

angular.module('divestop.addsite', [])
  .controller('AddSiteController', function(SharedProperties, DiveSites, Photos, AppMap) {
    this.site = {};
    this.site.features = [];
    this.site.aquaticLife = [];
    this.site.photos = [];
    this.site.coordinates = SharedProperties.newSite;
    this.showForm = SharedProperties.showForm;
    this.site.location = "key largo";
    this.site.comments = "testComment";
    this.site.gradient = "tG";

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
      this.site.photos = [];
      this.site.coordinates.lat = undefined;
      this.site.coordinates.lng = undefined;
    };

    this.addSite = function() {
      // Deep copy the object so we can stringify coordinates before passing to server
      var newSite = deepCopy(this.site);
      AppMap.addMarker(newSite, SharedProperties.map);
      this.hideForm();
      DiveSites.postNewSite(newSite).then(function(data) {
        this.clearForm();
      }.bind(this));
    };

    this.removePhoto = function(index) {
      this.site.photos.splice(index, 1);
    };

    this.addPhoto = function() {
      this.filePath = '';
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

    this.hideForm = function(){
      SharedProperties.showForm.state = false;
      AppMap.hideNewMarker();
    };

  })
  .directive('fileread', [function () {
    return {
        scope: {
            fileread: '='
        },
        link: function (scope, element, attributes) {
            element.bind('change', function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    };
  }])
  .directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        console.log(event.which);
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  });
