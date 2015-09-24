var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

var pg = require('pg');
var connectionString = 'postgres://jvswcsqzyyhjsq:ESK6iNDuI5K9BsOLIF9_OBn8MD@ec2-54-227-249-165.compute-1.amazonaws.com:5432/d90r1nq5eejjap';



pg.connect(connectionString, function(err, client, done) {
  if (err) {
    console.log('error fetching client from pool', err);
  }
  console.log('connected to database');
});

app.get('/', function(req, res) {
  res.send(200, 'Hello world!');
});

app.listen(port, function() {
  console.log("Listening on port: " + port);
});