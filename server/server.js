var express = require('../node_modules/express');
var parser = require('../node_modules/body-parser');
var path = require('path');
var db = require('./db.js');
var app = express();
var port = process.env.PORT || 3000;

/* Middleware */
app.use(parser.json());

/* Static File Serving */
app.use(express.static(path.join(__dirname, '../client')));



/* Routes */
app.get('/', function(req, res) {
  res.sendStatus(200);
});

app.get('/api/sites/:location', function(req, res) {
  var location = req.params.location.toLowerCase().replace(/\%20/g, ' ');

  db.search(function(sites) {
    res.json(sites);
  }, location);
});

app.get('/api/sites', function(req, res) {
  db.createTables(function(){
    db.search(function(sites) {
      res.json(sites);
    });
  });
});

app.post('/api/sites', function(req, res) {
  db.addSite(function() {
    res.sendStatus(201);
  }, req.body);
});

app.get('/api/keys', function(req, res) {
    res.json({
      'X-Parse-Application-Id': process.env['X-Parse-Application-Id'],
      'X-Parse-REST-API-Key': process.env['X-Parse-REST-API-Key']
    });
});


app.listen(port, function() {
  console.log("Listening on port: " + port);
});

exports.app = app;
