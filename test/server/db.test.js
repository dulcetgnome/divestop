var expect = require('chai').expect;
var db = require('../../server/db.js');

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (cb) {
  db.wipeDatabase(function(){ 
    cb();
  });
};

describe('Postgres Database Structure', function () {
  before(function (done) {
    db.createTables(function() {
      done();
    });
  });

  // Clear database before each test and then seed it with example `users` so that you can run tests
  beforeEach(function (done) {
    clearDB(function() {
      var sites = [
        {
          name: 'Oscars Oasis',
          location: 'Cuba',
          coordinates: {
            lat: 54.545,
            lng: 56.455
          },
          maxDepth: 25,
          gradient: '25d',
          features: ['cave', 'shipwreck'],
          aquaticLife: ['clown fish', 'hammerhead sharks'],
          description: "A very nice dive with clear water",
          comments: "This dive was both beautify and relaxing",
          photos: ['urlToPhoto']
        },
        {
          name: 'Irenas Island',
          location: 'San Diego',
          coordinates: {
            lat: 29.45,
            lng: 56.232
          },
          maxDepth: 20,
          gradient: '5d',
          features: ['shipwreck'],
          aquaticLife: ['giant tortoises', 'manta rays'],
          description: "A shallow dive with lots of sea life",
          comments: "Come for the shipwreck, stay for the manta rays",
          photos: ['urlToPhoto']
        },
        {
          name: 'Pauls Pier',
          location: 'Ft. Lauderdale',
          coordinates: {
            lat: 2.34,
            lng: 54.98
          },
          maxDepth: 30,
          gradient: '35d',
          features: ['coral'],
          aquaticLife: ['sea lions', 'giant tortoises'],
          description: "A shore dive with lots to offer",
          comments: "The best Florida dive spot north of Key Largo",
          photos: ['urlToPhoto']
        }
      ];

      db.addSite(function(){
        db.addSite(function(){
          db.addSite(function(){
            done();
          }, sites[2]);
        }, sites[1]);
      }, sites[0]);
    });
  });

  it('should have a method that, given no location, retrieves all dive sites from the database', function (done) {
    db.search(function(allSites) {
      expect(allSites.length).to.equal(3);
      done();
    });
  });
  
  it('should have a method that, given a latitude and longitude, retrieves all dive sites in that location from the database', function (done) {
    var params = [54.233, 56.454];
    db.search(function(allSites) {
      expect(allSites).to.have.length(1);
      done(); 
    }, params);
  });

  it('should have a method that given the data for a site, inserts that data into the database', function (done) {
    db.addSite(function() {
      db.search(function(sites) { 
        expect(sites[0].location).to.equal('sicily');
        done();
      }, [114.27, 54.89]);
    }, {
      name: 'Giuseppes Jetty',
      location: 'Sicily',
      coordinates: { 'lat': 114.27, 'lng': 54.89 },
      maxDepth: 55,
      gradient: '10d',
      features: ['coral'],
      aquaticLife: ['parrot fish', 'sting rays'],
      description: "A nice drift dive off the coast of Palermo",
      comments: "Make sure to try the great food in town.",
      photos: ['somePhotUrl']
    });
  });
});