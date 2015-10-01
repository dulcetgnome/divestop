var express = require('../node_modules/express');
var parser = require('../node_modules/body-parser');
var app = express();
var port = process.env.PORT || 3000;

/* Using pg-node https://github.com/brianc/node-postgres/wiki */
/* To install pg, run the following command: npm install pg */

var pg = require('pg');

/* URL for hosted heroku postgresql database */
var connectionString = process.env.DATABASE_URL;  // FORMAT THAT WORKS!
// var connectionString = process.env.DATABASE_URL || 'postgresql://localhost';  // TEST!
// var connectionString = 'postgresql://localhost';

/* Middleware */
app.use(parser.json());

/* Static File Serving */

app.use(express.static('client'));

exports.createTables = function(cb) {
  console.log('In create tables!');
  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      throw err;
    }
    console.log('About to being waterfall!');

    /*----------  Create Tables  ----------*/
    
    /* Check if table exists, if not create else do nothing. See postgresql docs for key syntax differences from mysql:
      -- AUTO_INCREMENT vs. SERIAL
      -- declaration of FOREIGN and PRIMARY KEYS (single line)
      -- single quotes only for values within queries
      -- don't use size when declaring INT column i.e. no INT(3)
    */

    client.query('CREATE TABLE IF NOT EXISTS locations (' +
      '_id SERIAL PRIMARY KEY, ' +
      'location VARCHAR(250) ' +
      ')', function(err, result){
        if (err) {
          throw err;
        }
        console.log('Locations built with:', result);
        done();
        client.query('CREATE TABLE IF NOT EXISTS aquatic_life (' +
          '_id SERIAL PRIMARY KEY, ' +
          'type VARCHAR(100) ' +
          ')', function(err, result){
            if (err) {
              throw err;
            }
            console.log('aquatic_life built with:', result);
            done();
            client.query('CREATE TABLE IF NOT EXISTS features (' +
              '_id SERIAL PRIMARY KEY, ' +
              'feature VARCHAR(100) ' +
              ')', function(err, result){
                if (err) {
                  throw err;
                }
                console.log('features built with:', result);
                done();
                client.query('CREATE TABLE IF NOT EXISTS sites (' +
                  '_id SERIAL PRIMARY KEY, ' +
                  'site VARCHAR(250), ' +
                  'location_id INT REFERENCES locations (_id), ' +
                  'lat NUMERIC, ' +
                  'long NUMERIC, ' +
                  'max_depth INT, ' +
                  'gradient VARCHAR(10), ' +
                  'description VARCHAR, ' +
                  'comments VARCHAR ' +
                  ')', function(err, result){
                    if (err) {
                      throw err;
                    }
                    console.log('sites built with:', result);
                    done();
                    client.query('CREATE TABLE IF NOT EXISTS pictures (' +
                      '_id SERIAL PRIMARY KEY, ' +
                      'site_id INT NOT NULL REFERENCES sites (_id), ' +
                      'picture VARCHAR(250) ' +
                      ')', function(err, result){
                        if (err) {
                          throw err;
                        }
                        console.log('pictures built with:', result);
                        done();
                        client.query('CREATE TABLE IF NOT EXISTS site_features (' +
                          'site_id INT NOT NULL REFERENCES sites (_id), ' +
                          'feature_id INT NOT NULL REFERENCES features (_id) ' +
                          ')', function(err, result){
                            if (err) {
                              throw err;
                            }
                            done();
                            console.log('site_features built with:', result);
                            client.query('CREATE TABLE IF NOT EXISTS site_aquatic_life (' +
                              'site_id INT NOT NULL REFERENCES sites (_id), ' +
                              'aquatic_life_id INT NOT NULL REFERENCES aquatic_life (_id) ' +
                              ')', function(err, result){
                                if (err) {
                                  throw err;
                                }
                                console.log('site_features and done!', result);
                                cb();
                                done();
                                // client.end();
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

/* DB Post Site Query */

exports.addSite = function(cb, passedSite) {
  pg.connect(connectionString, function(err, client, done) {
    if (err) {throw err;}
    console.log("Passed site", passedSite);

    /* If no location, add location */
    client.query('INSERT INTO locations (location) SELECT $1 WHERE NOT EXISTS ( ' +
      'SELECT location FROM locations WHERE location = $2)', [passedSite.location, 
      passedSite.location], 
      function(err, result){
        if (err) { throw err; }
        done();
      });
    if (passedSite.features === undefined) {
      console.log("passedSite: " + JSON.stringify(passedSite));
    }
    /* If no feature, add feature */
    for (var i = 0; i < passedSite.features.length; i++) {
      client.query('INSERT INTO features (feature) SELECT $1 WHERE NOT EXISTS ( ' +
        'SELECT feature FROM features WHERE feature = $2)', [passedSite.features[i], 
        passedSite.features[i]], 
        function(err, result){
          if (err) { throw err; }
          done();
      });
    }

    /* If no aquatic_life, add aq */
    for (var j = 0; j < passedSite.aquaticLife.length; j++) {
      client.query('INSERT INTO aquatic_life (type) SELECT $1 WHERE NOT EXISTS ( ' +
        'SELECT type FROM aquatic_life WHERE type = $2)', [passedSite.aquaticLife[j], 
        passedSite.aquaticLife[j]], 
        function(err, result){
          if (err) { throw err; }
          done();
      });
    }

    /* If no site, add site */
    client.query('INSERT INTO sites (site, location_id, lat, long, max_depth, gradient, ' + 
      'description, comments) SELECT ' + 
      '$1, ' +
      '(SELECT _id FROM locations WHERE location = $2), ' +
      '$3, ' +
      '$4, ' +
      '$5, ' +
      '$6, ' +
      '$7, ' +
      '$8 WHERE NOT EXISTS (' +
      'SELECT site FROM sites WHERE site = $9)', [passedSite.name, passedSite.location, 
      passedSite.coordinates.lat, passedSite.coordinates.lng, passedSite.maxDepth, passedSite.gradient, 
      passedSite.description, passedSite.comments, passedSite.name], 
      function(err, result) {
        if (err) { throw err; }
        done();
    });

    /* Add all features to join table site_feature */
    for (var k = 0; k < passedSite.features.length; k++) {
      // console.log("passedSite: " + passedSite.name + "feature" + i + ": " + passedSite.feature[i]);
      client.query('INSERT INTO site_features (site_id, feature_id) VALUES ((SELECT _id FROM sites ' + 
        'WHERE site = $1), ' + '(SELECT _id FROM features WHERE feature = $2))', 
        [passedSite.name, passedSite.features[k]], function(err, result) {
          if (err) { throw err; }
          done();
        });
    }

     /* Add all pictures to join picture table */
    for (var m = 0; m < passedSite.photos.length; m++) {
      client.query('INSERT INTO pictures (site_id, picture) VALUES ((SELECT _id FROM sites ' + 
        'WHERE site = $1), $2))',
        [passedSite.name, passedSite.photos[m]], function(err, result) {
          if (err) { throw err; }
          done();
        });
    }

     // Add all aquatic life to join table site_aquatic_life 
    for (var l = 0; l < passedSite.aquaticLife.length; l++) {
      client.query('INSERT INTO site_aquatic_life (site_id, aquatic_life_id) VALUES ((SELECT _id FROM sites ' + 
        'WHERE site = $1), ' + 
        '(SELECT _id FROM aquatic_life WHERE type = $2))', 
        [passedSite.name, passedSite.aquaticLife[l]], function(err, result) {
          if (err) { throw err; }
          done();
        });
    }

        // console.log("Created new site!!");
        done(); 
        cb();
  });
};

/* DB Search Query */

exports.search = function(cb, passedLocation) {
  var locationQuery = '';
  if (passedLocation) {
    var params = [passedLocation];
    locationQuery = ' WHERE (l.location = $1)';
  }

  var queryString = 'SELECT s.site, l.location, s.lat, s.long, s.max_depth, ' + 
     's.gradient, s.description, s.comments, a.type, f.feature FROM sites s ' + 
     'INNER JOIN locations l ON (s.location_id = l._id) INNER JOIN ' + 
     'site_features sf ON (sf.site_id = s._id) INNER JOIN features f ' + 
     'ON (sf.feature_id = f._id) INNER JOIN site_aquatic_life saq ' + 
     'ON (saq.site_id = s._id) INNER JOIN aquatic_life a ' + 
     'ON (a._id = saq.aquatic_life_id)' + 
     locationQuery + ';';


  pg.connect(connectionString, function(error, client, done) {
    client.query(queryString, params, function(err, result) {
      if (err) {
        throw err;
      }
      var siteObject = {};
      var resultsArray = [];
      // console.log(queryString);
      // console.log("SELECT result.rows.length: " + result.rows.length);
      for (var m = 0; m < result.rows.length; m++) {
        // console.log("row" + i + ": " + result.rows[i].site);
        if (result.rows[m].site === siteObject.site) {
          if (siteObject.feature.indexOf(result.rows[m].feature) < 0) {
            siteObject.feature.push(result.rows[m].feature);
          }
          if (siteObject.type.indexOf(result.rows[m].type) < 0) {
            siteObject.type.push(result.rows[m].type);
          }
        } else {
          if (siteObject.hasOwnProperty('site')) {
            resultsArray.push(siteObject);
          }
          siteObject = result.rows[m];

          // The following four lines ensure that the 'type' and 'feature' properties contain arrays.
          var firstAquaticLife = siteObject.type;
          siteObject.type = [firstAquaticLife];
          var firstFeature = siteObject.feature;
          siteObject.feature = [firstFeature];
        }
      }

      if (siteObject.hasOwnProperty('site')) {
        resultsArray.push(siteObject);
      }

      // console.log("resultsArray.length: " + resultsArray.length);
      done();
      cb(resultsArray);
    });
  });
};


exports.wipeDatabase = function(cb) {
  var queryString = 'TRUNCATE site_aquatic_life, site_features, pictures,' + 
  ' sites, features, aquatic_life, locations;';

  pg.connect(connectionString, function(error, client, done) {
    client.query(queryString, function(err, result) {
      if (err) {
        throw err;
      }
      done();
      cb();
    });
  });
};

app.get('/', function(req, res) {
  console.log('Tables created!');
  exports.createTables(function(){
    res.sendStatus(200);
  });
});

app.get('/api/sites/:location', function(req, res) {
  var location = req.params.location.toLowerCase().replace(/\%20/g, ' ');

  exports.search(function(location) {
    res.json(location);
  }, location);
});

app.get('/api/sites', function(req, res) { 
  console.log('In sites get!');
  res.sendStatus(200);  
  // exports.search(function(location) {
  //   res.json(location);
  // });
});

app.get('/api/keys', function(req, res) {
  // if (req.hostname === 'dulcetgnome.herokuapp.com') {
    res.json({
      'X-Parse-Application-Id': process.env['X-Parse-Application-Id'],
      'X-Parse-REST-API-Key': process.env['X-Parse-REST-API-Key']
    });
  // } else {
  //   res.send(401);
  // }
});

app.post('/api/sites', function(req, res) {
  exports.addSite(function() {
    res.sendStatus(201);
  }, req.body);
});

app.listen(port, function() {
  console.log("Listening on port: " + port);
});

exports.app = app;
