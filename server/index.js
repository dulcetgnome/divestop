var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

var pg = require('pg');
var connectionString = 'postgres://corey_air:!Gcc-104@localhost/corey_air';

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