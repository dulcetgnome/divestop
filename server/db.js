/* Using pg-node https://github.com/brianc/node-postgres/wiki */
/* To install pg, run the following command: npm install pg */

var pg = require('pg');
// 'postgresql://localhost';
/* URL for hosted heroku postgresql database */
var connectionString = process.env.DATABASE_URL || 'postgresql://localhost';
// var connectionString = process.env.DATABASE_URL || 'postgresql://postgres:aaa@localhost';


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
        'lat NUMERIC, ' +
        'long NUMERIC, ' +
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
                        if(cb) {
                          cb();
                        }
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

var addOneSite = function (sites, index, client, done, cb) {
  var currentSite = sites[index];

  var input = [
    currentSite.name,
    +currentSite.geometry.location.J,
    +currentSite.geometry.location.M,
    0,
    0,
    currentSite.vicinity
  ];

  client.query('SELECT * FROM sites WHERE site = $1 AND address = $2;', [input[0],input[5]], function (err, results) {
    if(results.rows.length === 0) {
      client.query('INSERT INTO sites (site, lat, long, upvote, downvote, address) VALUES ($1, $2, $3, $4, $5, $6);', input, 
        function (err, result) {
          // Add pictures from array
          var pictures_url = currentSite.photos;
          input[0] = currentSite.name.replace(/'/g, '\'\'')
          input[5] = currentSite.vicinity.replace(/'/g, '\'\'')

          if(pictures_url) {
            var queryString = '';
            for (var i=0; i<pictures_url.length; i++) {
              var picUrl = pictures_url[i].html_attributions[0].split('"')[1];
              queryString+='INSERT INTO pictures (site_id, picture) VALUES ((SELECT _id FROM sites ' + 
                      'WHERE site = \'' + input[0] + '\' AND address = \'' + input[5] + '\'), \'' + picUrl + '\'); ';
            }

            client.query(queryString,
              function (err, result) {
                if (err) {
                  throw err;
                // Next iteration
                } else if (index < sites.length-1) {
                  addOneSite(sites, ++index, client, done, cb);
                } else {
                  done();
                  if(cb) {
                    cb();
                  }
                }
              }
            );
            // If there are no pictures
          } else {
            if(index < sites.length-1) {
              addOneSite(sites, ++index, client, done, cb);
            } else {
              done();
              if(cb) {
                cb();
              }
            }          
          }
        }
      );
    } else {
      if(index < sites.length-1) {
        addOneSite(sites, ++index, client, done, cb);
      } else {
        done();
        if(cb) {
          cb();
        }
      }
    } 
  })
}

exports.addSites = function (cb, passedSites) {
  // console.log(passedSites)
  // var sites = JSON.parse(passedSites);
  var sites = passedSites;
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      throw err;
    }
    addOneSite(sites, 0, client, done, cb);
  });
};

/* DB Search Query 
   -- This query grabs all dive site data if no passedLocation argument is passed in, and the dive
   -- sites for a specific location if a passedLocation argument is passed in.
*/

exports.search = function (cb, passedLocation) {
  // passedlocation is array of long and latitude
  // should be integers

  // Each degree of latitude is approximately 69 miles (111 kilometers) apart. 
  // A degree of longitude is widest at the equator at 69.172 miles (111.321) and gradually shrinks to zero at the poles. At 40° north or south the distance between a degree of longitude is 53 miles (85 km).

  var locationQuery = '';
  var upperLat, upperLong, lowerLat, lowerLong, params;
  if (passedLocation) {
    Lat = + passedLocation[0];
    Long = + passedLocation[1];
  }

  params = [Lat, Long];
  // need to get lat and long from search
 
  locationQuery = ' WHERE acos(sin(radians(s.lat))*sin(radians($1)) + cos(radians(s.lat))*cos(radians($1))*cos(radians($2)-radians(s.long))) * 6371 < 10';

  var queryString = 'SELECT s.site, s.address, s.lat, s.long, ' + 
     's.upvote, s.downvote, p.picture FROM sites s ' + 
     'LEFT OUTER JOIN pictures p ' +
     'ON (p.site_id = s._id)' + 
     locationQuery + ';';

     console.log(queryString)
  pg.connect(connectionString, function (error, client, done) {
    client.query(queryString, params, function (err, results) {
      if (err) {
        throw err;
      }
      results = results.rows;
      var filtered_sites = results.filter(function (result) {
        return (+ result.upvote - result.downvote) > -5;
      })
      cb(filtered_sites);
      done();
    });
  });
};

// The wipeDatabase() method is used in the db tests.
exports.wipeDatabase = function (cb) {
  var queryString = 'TRUNCATE bars_visited, users, pictures, sites;';

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

exports.dropTables = function (cb) {
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
}


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
      }
    );
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
      }
    );
  });
};


