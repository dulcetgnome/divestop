var expect = require('chai').expect;
var Sites = require('../../server/index.js');

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  Sites.wipeDatabase(function(){ 
    done();
  });
};

describe('Postgres Database Structure', function () {
  before(function (done) {
    Sites.createTables(function() {
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
            lat: 54.343,
            lng: 56.454
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
        },
        {
          name: 'Angies Abyss',
          location: 'San Diego',
          coordinates: {
            lat: 134.09,
            lng: 54.35
          },
          maxDepth: 100,
          gradient: '45d',
          features: ['deep abyss'],
          aquaticLife: ['clown fish', 'sharks'],
          description: "A deep dive experience right off the coast of Southern California",
          comments: "How deep does that thing go?!",
          photos: ['urlToPhoto']
        },
        {
          name: 'Rogers Reef',
          location: 'Rio de Janeiro',
          coordinates: {
            lat: 94.5,
            lng: 34.12,
          },
          maxDepth: 50,
          gradient: '15d',
          features: ['coral', 'buried treasure'],
          aquaticLife: ['barracuda'],
          description: "Exotic species and the chance for riches",
          comments: "I didnt find any gold this trip but I plan to come back!",
          photos: ['urlToPhoto']
        }
      ];
      var promises = [];
      for (var i = 0; i < sites.length; i++) {
        promises.push(new Promise(function(resolve, reject) {
          Sites.addSite(function() {
            // console.log("Got into promise!");
            resolve();}, sites[i]);
        }));
      }

      Promise.all(promises).then(function() {done();});
    });
  });

  it('should have a method that, given no location, retrieves all dive sites from the database', function (done) {
    Sites.search(function(allSites) {
      // console.log("allSites[0].site (Oscars Oasis): " + allSites[0].site);
      // console.log("allSites[1].site (Irenas Island): " + allSites[1].site);
      // console.log("allSites[2].site (Pauls Pier): " + allSites[2].site);
      // console.log("allSites[3].site (Angies Abyss): " + allSites[3].site);
      // console.log("allSites[4].site (Rogers Reef): " + allSites[4].site);
      expect(allSites.length).to.equal(5);
      done();
    });
  });

  xit('should have a method that given the name of a location, retrieves site data for that location', function (done) {
    Sites.search(function(sites) { 
      expect(sites.length).to.equal(2);
      expect(sites[0].location).to.equal('San Diego');
      expect(sites[1].location).to.equal('San Diego');
      done();
    }, 'San Diego');
  });

  it('should have a method that given the data for a site, inserts that data into the database', function (done) {
    Sites.addSite(function() {
      // done();
    }, {
      site: 'Giuseppes Jetty',
      location: 'Sicily',
      lat: 114.27,
      long: 54.89,
      max_depth: 55,
      gradient: '10d',
      feature: ['coral'],
      type: ['parrot fish', 'sting rays'],
      description: "A nice drift dive off the coast of Palermo",
      comments: "Make sure to try the great food in town."
    });
    Sites.search(function(sites) { 
      expect(sites[0].location).to.equal('Sicily');
      // done();
    }, 'Sicily');

  });
});