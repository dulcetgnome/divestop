var express = require('../node_modules/express');
var parser = require('../node_modules/body-parser');
var app = express();
var port = process.env.PORT || 3000;

/* Using pg-node https://github.com/brianc/node-postgres/wiki */
/* To install pg, run the following command: npm install pg */

var pg = require('pg');

/* URL for hosted heroku postgresql database */
// var connectionString = process.env.DATABASE_URL;  // FORMAT THAT WORKS!
// var connectionString = process.env.DATABASE_URL || 'postgresql://localhost';  // TEST!
var connectionString = 'postgresql://localhost';

/* Middleware */
app.use(parser.json());

/* Static File Serving */

app.use(express.static('client'));

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
    */

    client.query('CREATE TABLE IF NOT EXISTS locations (' +
      '_id SERIAL PRIMARY KEY, ' +
      'location VARCHAR(250) ' +
      ')', function(err, result){
      if (err) {
        throw err;
      }
      done();
      }
    );

    client.query('CREATE TABLE IF NOT EXISTS aquatic_life (' +
      '_id SERIAL PRIMARY KEY, ' +
      'type VARCHAR(100) ' +
      ')', function(err, result){
      if (err) {
        throw err;
      }
      done();
      }
    );

    client.query('CREATE TABLE IF NOT EXISTS features (' +
      '_id SERIAL PRIMARY KEY, ' +
      'feature VARCHAR(100) ' +
      ')', function(err, result){
      if (err) {
        throw err;
      }
      done();
      }
    );


    client.query('CREATE TABLE IF NOT EXISTS sites (' +
      '_id SERIAL PRIMARY KEY, ' +
      'site VARCHAR(250), ' +
      'location_id INT REFERENCES locations (_id), ' +
      'coordinates VARCHAR(150), ' +
      'max_depth INT, ' +
      'gradient VARCHAR(10), ' +
      'description VARCHAR, ' +
      'comments VARCHAR ' +
      ')', function(err, result){
      if (err) {
        throw err;
      }
      done();
      }
    );

    client.query('CREATE TABLE IF NOT EXISTS pictures (' +
      '_id SERIAL PRIMARY KEY, ' +
      'site_id INT NOT NULL REFERENCES sites (_id), ' +
      'picture VARCHAR(250) ' +
      ')', function(err, result){
      if (err) {
        throw err;
      }
      done();
      }
    );

    /* Junction Tables */
    
    client.query('CREATE TABLE IF NOT EXISTS site_features (' +
      'site_id INT NOT NULL REFERENCES sites (_id), ' +
      'feature_id INT NOT NULL REFERENCES features (_id) ' +
      ')', function(err, result){
        done();
      }
    );

    client.query('CREATE TABLE IF NOT EXISTS site_aquatic_life (' +
      'site_id INT NOT NULL REFERENCES sites (_id), ' +
      'aquatic_life_id INT NOT NULL REFERENCES aquatic_life (_id) ' +
      ')', function(err, result){
        done();
      }
    );
  });
  cb();
};

/* DB Post Site Query */

exports.addSite = function(cb, passedSite) {
  pg.connect(connectionString, function(err, client, done) {
    if (err) {throw err;}

    /* If no location, add location */
    client.query('INSERT INTO locations (location) SELECT \'' + passedSite.location + '\' WHERE NOT EXISTS ( ' +
      'SELECT location FROM locations WHERE location = ' +
      '\'' + passedSite.location + '\'' +
      ')', function(err, result){
        if (err) { throw err; }
        done();
    });
    if (passedSite.feature === undefined) {
      console.log("passedSite: " + JSON.stringify(passedSite));
    }
    /* If no feature, add feature */
    for (var i = 0; i < passedSite.feature.length; i++) {
      client.query('INSERT INTO features (feature) SELECT \'' + passedSite.feature[i] + '\' WHERE NOT EXISTS ( ' +
        'SELECT feature FROM features WHERE feature = ' +
        '\'' + passedSite.feature[i] + '\'' +
        ')', function(err, result){
          if (err) { throw err; }
          done();
      });
    }

    /* If no aquatic_life, add aq */
    for (var k = 0; k < passedSite.type.length; k++) {
      client.query('INSERT INTO aquatic_life (type) SELECT \'' + passedSite.type[k] + '\' WHERE NOT EXISTS ( ' +
        'SELECT type FROM aquatic_life WHERE type = ' +
        '\'' + passedSite.type[k] + '\'' +
        ')', function(err, result){
          if (err) { throw err; }
          done();
      });
    }

    /* If no site, add site */
    client.query('INSERT INTO sites (site, location_id, coordinates, max_depth, gradient, ' + 
      'description, comments) SELECT ' + 
      '\'' + passedSite.site + '\', ' +
      '(SELECT _id FROM locations WHERE location = \'' + passedSite.location + '\'), ' +
      '\'' + passedSite.coordinates + '\', ' +
      '' + passedSite.max_depth + ', ' +
      '\'' + passedSite.gradient + '\', ' +
      '\'' + passedSite.description + '\', ' +
      '\'' + passedSite.comments + '\' WHERE NOT EXISTS (' +
      'SELECT site FROM sites WHERE site = ' +
      '\'' + passedSite.site + '\'' +
      ')', function(err, result) {
        if (err) { throw err; }

        /* Add all features to join table site_feature */
        for (var j = 0; j < passedSite.feature.length; j++) {
          client.query('INSERT INTO site_features (site_id, feature_id) VALUES ((SELECT _id FROM sites ' + 
            'WHERE site = \'' + passedSite.site + '\'), ' + 
            '(SELECT _id FROM features WHERE feature = \'' + passedSite.feature[j] + '\'))', function(err, result) {
              if (err) { throw err; }
              done();
            });
        }

         // Add all aquatic life to join table site_aquatic_life 
        for (var x = 0; x < passedSite.type.length; x++) {
          client.query('INSERT INTO site_aquatic_life (site_id, aquatic_life_id) VALUES ((SELECT _id FROM sites ' + 
            'WHERE site = \'' + passedSite.site + '\'), ' + 
            '(SELECT _id FROM aquatic_life WHERE type = \'' + passedSite.type[x] + '\'))', function(err, result) {
              if (err) { throw err; }
              done();
            });
        }
        done();
    });

    /* Add all features to join table site_feature */
    for (var i = 0; i < passedSite.feature.length; i++) {
      // console.log("passedSite: " + passedSite.site + "feature" + i + ": " + passedSite.feature[i]);
      client.query('INSERT INTO site_features (site_id, feature_id) VALUES ((SELECT _id FROM sites ' + 
        'WHERE site = \'' + passedSite.site + '\'), ' + 
        '(SELECT _id FROM features WHERE feature = \'' + passedSite.feature[i] + '\'))', function(err, result) {
          if (err) { throw err; }
          done();
        });
    }
    cb();
  });  
}
     // Add all aquatic life to join table site_aquatic_life 
    for (var i = 0; i < passedSite.type.length; i++) {
      client.query('INSERT INTO site_aquatic_life (site_id, aquatic_life_id) VALUES ((SELECT _id FROM sites ' + 
        'WHERE site = \'' + passedSite.site + '\'), ' + 
        '(SELECT _id FROM aquatic_life WHERE type = \'' + passedSite.type[i] + '\'))', function(err, result) {
          if (err) { throw err; }
          done();
        });
    }

        console.log("Created new site!!");
        done(); 
        cb();
  });
};

/* DB Search Query */

exports.search = function(cb, passedLocation) {
  var locationQuery = '';
  if (passedLocation) {
    locationQuery = ' WHERE (l.location = \'' + passedLocation + '\')';
  }

  var queryString = 'SELECT s.site, l.location, s.coordinates, s.max_depth, ' + 
     's.gradient, s.description, s.comments, a.type, f.feature FROM sites s ' + 
     'INNER JOIN locations l ON (s.location_id = l._id) INNER JOIN ' + 
     'site_features sf ON (sf.site_id = s._id) INNER JOIN features f ' + 
     'ON (sf.feature_id = f._id) INNER JOIN site_aquatic_life saq ' + 
     'ON (saq.site_id = s._id) INNER JOIN aquatic_life a ' + 
     'ON (a._id = saq.aquatic_life_id)' + 
     locationQuery + ';';


  pg.connect(connectionString, function(error, client, done) {
    client.query(queryString, function(err, result) {
      if (err) {
        throw err;
      }
      var siteObject = {};
      var resultsArray = [];
      // console.log(queryString);
      console.log("SELECT result.rows.length: " + result.rows.length);
      for (var i = 0; i < result.rows.length; i++) {
        console.log("row" + i + ": " + result.rows[i].site);
        if (result.rows[i].site === siteObject.site) {
          if (siteObject.feature.indexOf(result.rows[i].feature) < 0) {
            siteObject.feature.push(result.rows[i].feature);
          }
          if (siteObject.type.indexOf(result.rows[i].type) < 0) {
            siteObject.type.push(result.rows[i].type);
          }
        } else {
          if (siteObject.hasOwnProperty('site')) {
            resultsArray.push(siteObject);
          }
          siteObject = result.rows[i];

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

      console.log("resultsArray.length: " + resultsArray.length);
      done();
      cb(resultsArray);
    });
  });
}


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


  // var queryString = 'DELETE FROM site_aquatic_life;';

  // pg.connect(connectionString, function(error, client, done) {
  //   client.query(queryString, function(err, result) {
  //     if (err) {
  //       throw err;
  //     }

  //     done();
  //   });
  // });

  // var queryString = 'DELETE FROM site_features;';

  // pg.connect(connectionString, function(error, client, done) {
  //   client.query(queryString, function(err, result) {
  //     if (err) {
  //       throw err;
  //     }

  //     done();
  //   });
  // });

  // var queryString = 'DELETE FROM pictures;';

  // pg.connect(connectionString, function(error, client, done) {
  //   client.query(queryString, function(err, result) {
  //     if (err) {
  //       throw err;
  //     }

  //     done();
  //   });
  // });

  // var queryString = 'DELETE FROM sites;';

  // pg.connect(connectionString, function(error, client, done) {
  //   client.query(queryString, function(err, result) {
  //     if (err) {
  //       throw err;
  //     }

  //     done();
  //   });
  // });

  // var queryString = 'DELETE FROM features;';

  // pg.connect(connectionString, function(error, client, done) {
  //   client.query(queryString, function(err, result) {
  //     if (err) {
  //       throw err;
  //     }

  //     done();
  //   });
  // });

  // var queryString = 'DELETE FROM aquatic_life;';

  // pg.connect(connectionString, function(error, client, done) {
  //   client.query(queryString, function(err, result) {
  //     if (err) {
  //       throw err;
  //     }

  //     done();
  //   });
  // });

  // var queryString = 'DELETE FROM locations;';

  // pg.connect(connectionString, function(error, client, done) {
  //   client.query(queryString, function(err, result) {
  //     if (err) {
  //       throw err;
  //     }

  //     done();
  //     cb();
  //   });
  // });
};

app.get('/', function(req, res) {
  res.send(200);
});

app.get('/api/sites/:location', function(req, res) {
  var location = req.params.location.toLowerCase().replace(/\%20/g, ' ');

  exports.search(function(location) {
    res.json(location);
  }, location);
});

app.get('/api/sites', function(req, res) {    
  exports.search(function(location) {
    res.json(location);
  });
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