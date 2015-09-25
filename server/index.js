var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

var pg = require('pg');
var connectionString = 'postgres://wzypzgrifbmmqn:J3vMBj5wK5nb-Z4dFjcfwqSXZL@ec2-54-243-149-147.compute-1.amazonaws.com:5432/d3dvhl55btercp';



pg.connect(connectionString, function(err, client, done) {
  if (err) {
    console.log('error fetching client from pool', err);
  }

  /* Check if table exists, if not create else do nothing */
  client.query('CREATE TABLE locations (' +
    '_id INT NOT NULL AUTO_INCREMENT, ' +
    'location VARCHAR(250), ' +
    'PRIMARY KEY (_id) ' +
    )', function(err, result){
    if (err) {
      throw err;
    }
    done();
  });

  client.query('CREATE TABLE aquatic_life (' +
    '_id INT NOT NULL AUTO_INCREMENT, ' +
    'type VARCHAR(100), ' +
    'PRIMARY KEY (_id) ' +
    )', function(err, result){
    if (err) {
      throw err;
    }
    done();
  });

  client.query('CREATE TABLE features (' +
    '_id INT NOT NULL AUTO_INCREMENT, ' +
    'feature VARCHAR(100), ' +
    'PRIMARY KEY (_id) ' +
    )', function(err, result){
    if (err) {
      throw err;
    }
    done();
  });

  client.query('CREATE TABLE pictures (' +
    '_id INT NOT NULL AUTO_INCREMENT, ' +
    'site_id INT NOT NULL, ' +
    'picture VARCHAR(250), ' +
    'PRIMARY KEY (_id), ' +
    'FOREIGN KEY (site_id) REFERENCES sites (_id)
    )', function(err, result){
    if (err) {
      throw err;
    }
    done();
  });

  client.query('CREATE TABLE sites (' +
    '_id INT NOT NULL AUTO_INCREMENT, ' +
    'site VARCHAR(250), ' +
    'location_id INT NOT NULL, ' +
    'coordinates VARCHAR(150), ' +
    'max_depth INT(3), ' +
    'gradient VARCHAR(10), ' +
    'description BLOB, ' +
    'comments BLOB, ' +
    'PRIMARY KEY (_id), ' +
    'FOREIGN KEY (location_id) REFERENCES locations (_id) ' +
    )', function(err, result){
    if (err) {
      throw err;
    }
    done();
  });

  client.query('CREATE TABLE site_features (' +
    'site_id INT NOT NULL, ' +
    'feature_id INT NOT NULL, ' +
    'FOREIGN KEY (site_id) REFERENCES sites (_id), ' +
    'FOREIGN KEY (feature_id) REFERENCES featues (_id) ' +
    )', function(err, result){
      done();
  });

  client.query('CREATE TABLE site_aquatic_life (' +
    'site_id INT NOT NULL, ' +
    'aquatic_life_id INT NOT NULL, ' +
    'FOREIGN KEY (site_id) REFERENCES sites (_id), ' +
    'FOREIGN KEY (aquatic_life_id) REFERENCES aquatic_life (_id) ' +
    )', function(err, result){
      done();
  });


});


app.get('/', function(req, res) {
  res.send(200, 'Hello world!');
});

app.listen(port, function() {
  console.log("Listening on port: " + port);
});