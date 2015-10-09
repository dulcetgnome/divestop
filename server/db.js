/* Using pg-node https://github.com/brianc/node-postgres/wiki */
/* To install pg, run the following command: npm install pg */

var pg = require('pg');

/* URL for hosted heroku postgresql database */
var connectionString = process.env.DATABASE_URL || 'postgresql://postgres:aaa@localhost';

exports.createTables = function (cb) {
  pg.connect(connectionString, function (err, client, done) {
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

      client.query('CREATE TABLE IF NOT EXISTS sites (' +
        '_id SERIAL PRIMARY KEY, ' +
        'site VARCHAR(250), ' +
        'lat NUMERIC(5), ' +
        'long NUMERIC(5), ' +
        'upvote INT, ' +
        'downvote INT, ' +
        'address VARCHAR(250)' +
        ')', function (err, result) {
          if (err) {
            throw err;
          }
          done();
          client.query('CREATE TABLE IF NOT EXISTS pictures (' +
            '_id SERIAL PRIMARY KEY, ' +
            'site_id INT NOT NULL REFERENCES sites (_id), ' +
            'picture VARCHAR(250) ' +
            ')', function (err, result) {
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
                  ')', function (err, result) {
                    if (err) {
                      throw err;
                    }
                    done();
                    client.query('CREATE TABLE IF NOT EXISTS bars_visited (' +
                      'user_id INT NOT NULL REFERENCES users (_id), ' +
                      'bar_id INT NOT NULL REFERENCES sites (_id) ' +
                      ')', function (err, result) {
                        if (err) {
                          throw err;
                        }
                        done();
                        cb();
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

exports.addSite = function (cb, passedSite) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {throw err;}
    // add site via google or manually

  });
};

/* DB Search Query 
   -- This query grabs all dive site data if no passedLocation argument is passed in, and the dive
   -- sites for a specific location if a passedLocation argument is passed in.
*/

exports.search = function (cb, passedLocation) {
  // passedlocation is array of long and latitude
  // should be integers
  var locationQuery = '';
  var upperLat, upperLong, lowerLat, lowerLong, params;
  if (passedLocation) {
    upperLat = passedLocation[0] + 1;
    lowerLat = passedLocation[0] - 1;
    upperLong = passedLocation[1] + 1;
    lowerLong = passedLocation[1] - 1;
  }

  params = [lowerLat, upperLat, lowerLong, upperLong];
  // need to get lat and long from search 
  locationQuery = ' WHERE s.lat BETWEEN $1 AND $2 AND s.long BETWEEN $3 AND $4';

  var queryString = 'SELECT s.site, s.address, s.lat, s.long, ' + 
     's.upvote, s.downvote, a.type, p.picture FROM sites s ' + 
     'LEFT OUTER JOIN pictures p ' +
     'ON (p.site_id = s._id)' + 
     locationQuery + ';';


  pg.connect(connectionString, function (error, client, done) {
    client.query(queryString, params, function (err, result) {
      if (err) {
        throw err;
      }

      var filtered_sites = [];
      cb(filtered_sites);
      done();
    });
  });
};

// The wipeDatabase() method is used in the db tests.
exports.wipeDatabase = function (cb) {
  var queryString = 'DROP TABLE bars_visited, users, pictures, sites;';

  pg.connect(connectionString, function (error, client, done) {
    client.query(queryString, function (err, result) {
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
  pg.connect(connectionString, function (err, client, done) {
    if (err) {throw err;}

    /* If no location, add location */
    client.query('INSERT INTO users (fb_id, first_name, last_name) VALUES ($1, $2, $3)', [fbdata.fb_id, fbdata.first_name, fbdata.last_name], 
      function (err, result) {
        if (err) { throw err; }
        done();
        cb(result);
      });
  });
};


// Find user by facebook ID in an array of object
exports.findUser = function (id, cb) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) {throw err;}

    /* find user by his facebook id */
    client.query('SELECT * FROM users WHERE fb_id = $1', [id], 
      function (err, result) {
        if (err) { 
          throw err; 
        }
        done();
        cb(result.rows);
      });
  });
};


