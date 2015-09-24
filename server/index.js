var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

var pg = require('pg');
var connectionString = 'postgres://wzypzgrifbmmqn:J3vMBj5wK5nb-Z4dFjcfwqSXZL@ec2-54-243-149-147.compute-1.amazonaws.com:5432/d3dvhl55btercp';



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