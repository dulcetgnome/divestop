var express = require('../node_modules/express');
var app = express();
var port = process.env.PORT || 3000;

/* Using pg-node https://github.com/brianc/node-postgres/wiki */
var pg = require('pg');

/* URL for hosted heroku postgresql database */
var connectionString = process.env.DATABASE_URL;



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

/* DB Search Query */

function search(cb, location) {
  if (location) {
    locationQuery = ' WHERE (l.location = ' + location + ')';
  } else {
    locationQuery = '';
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
      
      for (var i = 0; i < result.rows.length; i++) {
        if (result.rows[i].site === siteObject.site) {
          if (siteObject.feature.indexOf(result.rows[i].feature) < 0) {
            console.log('Adding feature', result.rows[i].feature);
            siteObject.feature.push(result.rows[i].feature);
          }
          if (siteObject.type.indexOf(result.rows[i].type) < 0) {
            console.log('In aq_life statement: ', result.rows[i].type);
            siteObject.type.push(result.rows[i].type);
          }
        } else {
          if (siteObject.hasOwnProperty('site')) {
            resultsArray.push(siteObject);
          }
          siteObject = result.rows[i];
          var firstAquaticLife = siteObject.type;
          siteObject.type = [firstAquaticLife];
          var firstFeature = siteObject.feature;
          siteObject.feature = [firstFeature];
        }
      }

      if (siteObject.hasOwnProperty('site')) {
        resultsArray.push(siteObject);
      }

      cb(resultsArray);
      done();
    });
  });
};


app.get('/', function(req, res) {
  res.send(200, 'Hello world!');
});

app.get('/api/sites/:location', function(req, res) {
  var location = req.params.location.toLowerCase().replace(/\%20/g, ' ');

  search(function(location) {
    res.json(location);
  }, location);
});

app.get('/api/sites', function(req, res) {    
  search(function(location) {
    res.json(location);
  });
});

app.listen(port, function() {
  console.log("Listening on port: " + port);
});