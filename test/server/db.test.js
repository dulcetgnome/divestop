var expect = require('chai').expect;
var Sites = require('../../server/index.js');

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  Sites.wipeDatabase(done);
}

describe('Postgres Database Structure', function () {
  before(function (done) {
    Sites.createTables(done);
  });

  // Clear database before each test and then seed it with example `users` so that you can run tests
  beforeEach(function (done) {
    clearDB(function() {
      var sites = [
        {
          site: 'Oscars Oasis',
          location: 'Cuba',
          lat: 54.343,
          long: 56.454,
          max_depth: 25,
          gradient: '25d',
          feature: ['cave', 'shipwreck'],
          type: ['clown fish', 'hammerhead sharks'],
          description: "A very nice dive with clear water",
          comments: "This dive was both beautify and relaxing"
        },
        {
          site: 'Irenas Island',
          location: 'San Diego',
          lat: 29.45,
          long: 56.232,
          max_depth: 20,
          gradient: '5d',
          feature: ['shipwreck'],
          type: ['giant tortoises', 'manta rays'],
          description: "A shallow dive with lots of sea life",
          comments: "Come for the shipwreck, stay for the manta rays"
        },
        {
          site: 'Pauls Pier',
          location: 'Ft. Lauderdale',
          lat: 2.34,
          long: 54.98,
          max_depth: 30,
          gradient: '35d',
          feature: ['coral'],
          type: ['sea lions', 'giant tortoises'],
          description: "A shore dive with lots to offer",
          comments: "The best Florida dive spot north of Key Largo"
        },
        {
          site: 'Angies Abyss',
          location: 'San Diego',
          lat: 134.09,
          long: 54.35,
          max_depth: 100,
          gradient: '45d',
          feature: ['deep abyss'],
          type: ['clown fish', 'sharks'],
          description: "A deep dive experience right off the coast of Southern California",
          comments: "How deep does that thing go?!"
        },
        {
          site: 'Rogers Reef',
          location: 'Rio de Janeiro',
          lat: 94.5,
          long: 34.12,
          max_depth: 50,
          gradient: '15d',
          feature: ['coral', 'buried treasure'],
          type: ['barracuda'],
          description: "Exotic species and the chance for riches",
          comments: "I didnt find any gold this trip but I plan to come back!"
        }
      ];
      var promises = [];
      for (var i = 0; i < sites.length; i++) {
        promises.push(new Promise(function(resolve, reject) {
          Sites.addSite(function() {
            console.log("Got into promise!");
            resolve();}, sites[i]);
        }));
      }

      Promise.all(promises).then(function() {done()});

      // for (var i = 0; i < sites.length; i++) {
      //   var p = new Promise(function(resolve, reject) {
      //       Sites.addSite(function() {
      //         console.log("Got into promise!");
      //         resolve();}, sites[i]);
      //     });
      //   p.then(function() {done()});
      // }
    });
  });

  it('should have a method that, given no location, retrieves all dive sites from the database', function (done) {
    Sites.search(function(allSites) {
      console.log("allSites[0].site (Oscars Oasis): " + allSites[0].site);
      console.log("allSites[1].site (Irenas Island): " + allSites[1].site);
      console.log("allSites[2].site (Pauls Pier): " + allSites[2].site);
      console.log("allSites[3].site (Angies Abyss): " + allSites[3].site);
      console.log("allSites[4].site (Rogers Reef): " + allSites[4].site);
      expect(allSites.length).to.equal(5);
      done();
    });
  });

  xit('should have a method that given the name of a location, retrieves site data for that location', function (done) {
    Sites.search(function(sites) { 
      expect(sites.length).to.equal(2);
      expect(sites[0].location).to.equal('San Diego');
      expect(sites[1].location).to.equal('San Diego');
      // done();
    }, 'San Diego');
  });

  xit('should have a method that given the data for a site, inserts that data into the database', function (done) {
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