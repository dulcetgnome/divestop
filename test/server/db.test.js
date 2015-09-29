var expect = require('chai').expect;
var Sites = require('../server/index.js');


var dbURI = 'XXX';  // ENTER DB URI!

// The `clearDB` helper function, when invoked, will clear the database
var clearDB = function (done) {
  // mongoose.connection.collections['users'].remove(done)   // DETERMINE HOW TO DO THIS
}

describe('Postgres Database Structure', function () {

  // Connect to database before any tests
  before(function (done) {                        // ADD DB CONNECTION CODE
    // if (mongoose.connection.db) return done();
    // mongoose.connect(dbURI, done);
  });

  // Clear database before each test and then seed it with example `users` so that you can run tests
  beforeEach(function (done) {
    clearDB(function() {
      var sites = [
        {
          site: 'Oscars Oasis',
          location: 'Cuba',
          coordinates: '54, 56',
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
          coordinates: '29, 16',
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
          coordinates: '2, 110',
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
          coordinates: '134, 67',
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
          coordinates: '94, 5',
          max_depth: 50,
          gradient: '15d',
          feature: ['coral', 'buried treasure'],
          type: ['barracuda'],
          description: "Exotic species and the chance for riches",
          comments: "I didn't find any gold this trip but I plan to come back!"
        }
      ]

      // See http://mongoosejs.com/docs/models.html for details on the `create` method
      // User.create(users, done);          // DETERMINE HOW TO DO THIS IN POSTGRES
    });
  });

  // it('should have a test variable', function (done) {
  //     expect(Sites.test).to.equal('test');
  //     done();
  //     // console.log("result: " + result);

  //   // TODO: Write test(s) for a method exported by `userController` that behaves as described one line above
  //   // HINT: The `done` passed in is quite important...
  // });

  // it('should have a working test function', function (done) {
  //     expect(Sites.testFunction()).to.equal('Yes!');
  //     done();
  //     // console.log("result: " + result);


  it('should have a method that, given no location, retrieves all dive sites from the database', function (done) {
    Sites.search(function(allSites) { 
      expect(allSites.length).to.equal(5);   // CHECK INTO HOW TO CLEAR DB SAFELY TO TEST THIS!
      done();
    });
  });

  it('should have a method that given the name of a location, retrieves site data for that location', function (done) {
    Sites.search(function(sites) { 
      expect(sites.length).to.equal(2);   // CHECK INTO HOW TO CLEAR DB SAFELY TO TEST THIS!
      expect(sites[0].location).to.equal('San Diego');
      expect(sites[1].location).to.equal('San Diego');
      done();
    }, 'San Diego');
  });

  it('should have a method that given the data for a site, inserts that data into the database', function (done) {
    Sites.addSite(function(newSite) {
      // TO DO: GRAB DATA TO TEST!
      done();
    }, {
      site: 'Giuseppes Jetty',
      location: 'Sicily',
      coordinates: '114, 27',
      max_depth: 55,
      gradient: '10d',
      feature: ['coral'],
      type: ['parrot fish', 'sting rays'],
      description: "A nice drift dive off the coast of Palermo",
      comments: "Make sure to try the great food in town."
    });
  });
});