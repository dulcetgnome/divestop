/* Using pg-node https://github.com/brianc/node-postgres/wiki */
/* To install pg, run the following command: npm install pg */

var pg = require('pg');

/* URL for hosted heroku postgresql database */
var connectionString = process.env.DATABASE_URL || 'postgresql://postgres:aaa@localhost/bowen';

exports.createTables = function(cb) {
  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      throw err;
    }

    /*----------  Create Tables  ----------*/
    
    /* Check if table exists, if not create else do nothing. See postgresql docs for key syntax differences from mysql:
      -- AUTO_INCREMENT vs. SERIAL
      -- declaration of FOREIGN and PRIMARY KEYS (single line)
      -- single quotes only for values within queries
      -- don't use size when declaring INT column i.e. no INT(3)

      -- The create table queries are nested inside the callbacks of the preceding query, due to the
      -- asyncronous nature of database queries. They should be created in this order.
    */

    client.query('CREATE TABLE IF NOT EXISTS locations (' +
      '_id SERIAL PRIMARY KEY, ' +
      'location VARCHAR(250) ' +
      ')', function(err, result){
        if (err) {
          throw err;
        }
        done();
        client.query('CREATE TABLE IF NOT EXISTS aquatic_life (' +
          '_id SERIAL PRIMARY KEY, ' +
          'type VARCHAR(100) ' +
          ')', function(err, result){
            if (err) {
              throw err;
            }
            done();
            client.query('CREATE TABLE IF NOT EXISTS features (' +
              '_id SERIAL PRIMARY KEY, ' +
              'feature VARCHAR(100) ' +
              ')', function(err, result){
                if (err) {
                  throw err;
                }
                done();
                client.query('CREATE TABLE IF NOT EXISTS sites (' +
                  '_id SERIAL PRIMARY KEY, ' +
                  'site VARCHAR(250), ' +
                  'location_id INT REFERENCES locations (_id), ' +
                  'lat NUMERIC(5), ' +
                  'long NUMERIC(5), ' +
                  'max_depth INT, ' +
                  'gradient VARCHAR(10), ' +
                  'description VARCHAR, ' +
                  'comments VARCHAR ' +
                  ')', function(err, result){
                    if (err) {
                      throw err;
                    }
                    done();
                    client.query('CREATE TABLE IF NOT EXISTS pictures (' +
                      '_id SERIAL PRIMARY KEY, ' +
                      'site_id INT NOT NULL REFERENCES sites (_id), ' +
                      'picture VARCHAR(250) ' +
                      ')', function(err, result){
                        if (err) {
                          throw err;
                        }
                        done();
                        client.query('CREATE TABLE IF NOT EXISTS site_features (' +
                          'site_id INT NOT NULL REFERENCES sites (_id), ' +
                          'feature_id INT NOT NULL REFERENCES features (_id) ' +
                          ')', function(err, result){
                            if (err) {
                              throw err;
                            }
                            done();
                            client.query('CREATE TABLE IF NOT EXISTS site_aquatic_life (' +
                              'site_id INT NOT NULL REFERENCES sites (_id), ' +
                              'aquatic_life_id INT NOT NULL REFERENCES aquatic_life (_id) ' +
                              ')', function(err, result){
                                if (err) {
                                  throw err;
                                }
                                done();
                                client.query('CREATE TABLE IF NOT EXISTS users (' +
                                  '_id SERIAL PRIMARY KEY, ' +
                                  'fb_id VARCHAR(250), ' +
                                  'username VARCHAR(250), ' +
                                  'first_name VARCHAR(250), ' +
                                  'last_name VARCHAR(250), ' +
                                  'email VARCHAR(250) ' +
                                  ')', function(err, result){
                                    if (err) {
                                      throw err;
                                    }
                                    done();
                                    client.query('CREATE TABLE IF NOT EXISTS bars_visited (' +
                                      'user_id INT NOT NULL REFERENCES users (_id), ' +
                                      'bar_id INT NOT NULL REFERENCES sites (_id) ' +
                                      ')', function(err, result){
                                        if (err) {
                                          throw err;
                                        }
                                        done();
                                        cb();
                                      });
                                  });
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

/* DB Post Site Query 
-- The insert statements must be executed in the specified order. Due to the asyncronous nature of
   database queries, each insert statement is nested inside the callback function of the preceding
   insert statement.
*/

exports.addSite = function(cb, passedSite) {
  pg.connect(connectionString, function(err, client, done) {
    if (err) {throw err;}

    /* If no location, add location */
    client.query('INSERT INTO locations (location) SELECT $1 WHERE NOT EXISTS ( ' +
      'SELECT location FROM locations WHERE location = $2)', [passedSite.location.toLowerCase(), 
      passedSite.location.toLowerCase()], 
      function(err, result){
        if (err) { throw err; }

        /* If no feature, add feature 
           -- Build 'featureString' dynamically, creating an insert query for each feature in the
              features array that is passed from client.
        */
        var featureString = '';
        for (var n = 0; n < passedSite.features.length; n++) {
          featureString += 'INSERT INTO features (feature) SELECT \'' + passedSite.features[n] + '' +
          '\' WHERE NOT EXISTS (SELECT feature FROM features WHERE feature = \'' + passedSite.features[n] + '\'); ';
        }
        client.query(featureString, function(err, result){
          if (err) { throw err; }

          /* Insert aquatic life
            -- Build 'aquaticLifeString' dynamically, creating an insert query for each instance of aquatic life in the
               aquatic life array that is passed from client.
          */
          var aquaticLifeString = '';
          for (var p = 0; p < passedSite.aquaticLife.length; p++) {
            aquaticLifeString += 'INSERT INTO aquatic_life (type) SELECT \'' + passedSite.aquaticLife[p] + '' +
            '\' WHERE NOT EXISTS (SELECT type FROM aquatic_life WHERE type = \'' + passedSite.aquaticLife[p] + '\'); ';
          }
          client.query(aquaticLifeString, function(err, result){
    
            if (err) { 
              throw err; 
            }
            client.query('INSERT INTO sites (site, location_id, lat, long, max_depth, gradient, description, comments) SELECT \'' + passedSite.name + '\', (SELECT _id FROM locations WHERE ' + 
              'location = \'' + passedSite.location.toLowerCase() + '\'), ' + passedSite.coordinates.lat + ', ' + passedSite.coordinates.lng + ', ' + passedSite.maxDepth + ', \'' + passedSite.gradient + '\', \'' + passedSite.description + '\', \'' + passedSite.comments + '\' WHERE NOT EXISTS (SELECT site FROM sites WHERE site = \'' + passedSite.name + '\');', 
              function(err, result) {
                if (err) {
                  throw err; 
                }

                /* Insert ids into site_features join table
                  -- Build 'siteFeaturesString' dynamically, creating an insert query for each site/feature that is 
                     passed from client.
                */
                var siteFeaturesString = '';
                for (var q = 0; q < passedSite.features.length; q++) {
                  siteFeaturesString += 'INSERT INTO site_features (site_id, feature_id) VALUES ((SELECT _id FROM sites ' + 
                  'WHERE site = \'' + passedSite.name + '\'), (SELECT _id FROM features WHERE feature = \'' + passedSite.features[q] + '\')); ';
                }
                client.query(siteFeaturesString, function(err, result){
                  if (err) { throw err; }

                  /* Insert photo urls
                    -- Build 'photoString' dynamically, creating an insert query for each photo url in the
                       photo array that is passed from client.
                  */
                  var photosString = '';
                  for (var q = 0; q < passedSite.photos.length; q++) {
                    photosString += 'INSERT INTO pictures (site_id, picture) VALUES ((SELECT _id FROM sites ' + 
                    'WHERE site = \'' + passedSite.name + '\'), \'' + passedSite.photos[q] + '\'); ';
                  }
                  client.query(photosString, function(err, result){
                    if (err) { throw err; }

                    /* Insert ids into site_aquatic_life join table
                      -- Build 'siteAquaticLifeString' dynamically, creating an insert query for each site/aquatic life that is 
                         passed from client.
                    */
                    var siteAquaticLifeString = '';
                    for (var q = 0; q < passedSite.aquaticLife.length; q++) {
                      siteAquaticLifeString += 'INSERT INTO site_aquatic_life (site_id, aquatic_life_id) ' + 
                      'VALUES ((SELECT _id FROM sites WHERE site = \'' + passedSite.name + '\'), ' + 
                      '(SELECT _id FROM aquatic_life WHERE type = \'' + passedSite.aquaticLife[q] + '\')); ';
                    }
                    client.query(siteAquaticLifeString, function(err, result){
                      if (err) { throw err; }
                      done();
                      cb();
                    });
                  });
                });
            });
          });
        });
    });
  });
};

/* DB Search Query 
   -- This query grabs all dive site data if no passedLocation argument is passed in, and the dive
   -- sites for a specific location if a passedLocation argument is passed in.
*/

exports.search = function(cb, passedLocation) {
  // passedlocation is array of long and latitude
  // should be integers
  var locationQuery = '';
  var upperLat, upperLong, lowerLat, lowerLong, params;
  if (passedLocation) {
    upperLat = passedLocation[0] + 1;
    lowerLat = passedLocation[0] - 1;
    upperLong = passedLocation[1] + 1;
    lowerLong = passedLocation[1] - 1;
    params = [lowerLat, upperLat, lowerLong, upperLong];
    // need to get lat and long from search 
    locationQuery = ' WHERE s.lat BETWEEN $1 AND $2 AND s.long BETWEEN $3 AND $4';
  }

  var queryString = 'SELECT s.site, l.location, s.lat, s.long, s.max_depth, ' + 
     's.gradient, s.description, s.comments, a.type, p.picture, f.feature FROM sites s ' + 
     'LEFT OUTER JOIN locations l ON (s.location_id = l._id) LEFT OUTER JOIN ' + 
     'site_features sf ON (sf.site_id = s._id) LEFT OUTER JOIN features f ' + 
     'ON (sf.feature_id = f._id) LEFT OUTER JOIN site_aquatic_life saq ' + 
     'ON (saq.site_id = s._id) LEFT OUTER JOIN aquatic_life a ' + 
     'ON (a._id = saq.aquatic_life_id) LEFT OUTER JOIN pictures p ' +
     'ON (p.site_id = s._id)' + 
     locationQuery + ';';


  pg.connect(connectionString, function(error, client, done) {
    client.query(queryString, params, function(err, result) {
      if (err) {
        throw err;
      }

      /* This code reconstitutes the data such that if a site has multiple features or aquatic life,
         a single row for that site is created, with an array for the features/aquatic life. 
      */

      var siteObject = {};
      var sites = [];
      for (var m = 0; m < result.rows.length; m++) {
        if (result.rows[m].site === siteObject.name) {

          if (siteObject.features.indexOf(result.rows[m].feature) < 0) {
            siteObject.features.push(result.rows[m].feature);
          }
          if (siteObject.aquaticLife.indexOf(result.rows[m].type) < 0) {
            siteObject.aquaticLife.push(result.rows[m].type);
          }
          if (siteObject.pictures.indexOf(result.rows[m].picture) < 0) {
            siteObject.pictures.push(result.rows[m].picture);
          }
        } else {
          if (siteObject.hasOwnProperty('name')) {
            sites.push(siteObject);
          }
          siteObject = result.rows[m];

          siteObject.name = result.rows[m].site;
          delete siteObject.site;

          /* Nuke lat/long */
          siteObject.coordinates = { 'lat': +result.rows[m].lat, 'lng': +result.rows[m].long };
          delete siteObject.lat;
          delete siteObject.long;

          siteObject.features = result.rows[m].feature;
          delete siteObject.feature;

          siteObject.aquaticLife = result.rows[m].type;
          delete siteObject.type;

          siteObject.maxDepth = result.rows[m].max_depth;
          delete siteObject.max_depth;


          siteObject.pictures = result.rows[m].picture;
          delete siteObject.picture;
          
          // The following four lines ensure that the 'type' and 'feature' properties contain arrays.
          var firstAquaticLife = siteObject.aquaticLife;
          siteObject.aquaticLife = [firstAquaticLife];
          var firstFeature = siteObject.features;
          siteObject.features = [firstFeature];
          var firstPicture = siteObject.pictures;
          siteObject.pictures = [firstPicture];
        }
      }

      if (siteObject.hasOwnProperty('name')) {
        sites.push(siteObject);
      }
      cb(sites);
      done();
    });
  });
};

// The wipeDatabase() method is used in the db tests.
exports.wipeDatabase = function(cb) {
  var queryString = 'TRUNCATE bars_visited, users, site_aquatic_life, site_features, pictures,' + 
  ' sites, features, aquatic_life, locations;';

  pg.connect(connectionString, function(error, client, done) {
    client.query(queryString, function(err, result) {
      if (err) {
        throw err;
      }
      done();
      if(cb)
        cb();
    });
  });
};

// Add a user to the database 
exports.addUser = function (fbdata, cb) {
  pg.connect(connectionString, function(err, client, done) {
    if (err) {throw err;}

    /* If no location, add location */
    client.query('INSERT INTO users (fb_id, first_name, last_name) VALUES ($1, $2, $3)', [fbdata.fb_id, fbdata.first_name, fbdata.last_name], 
      function(err, result){
        if (err) { throw err; }
        done();
        cb(result);
      });
  });
};

exports.findUser = function (id, cb) {
  pg.connect(connectionString, function(err, client, done) {
    if (err) {throw err;}

    /* find user by his facebook id */
    client.query('SELECT * FROM users WHERE fb_id = $1', [id], 
      function(err, result){
        if (err) { 
          throw err; 
        }
        done();
        cb(result.rows);
      });
  });
};


