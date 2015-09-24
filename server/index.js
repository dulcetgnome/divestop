var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
  res.send(200, 'Hello world!');
});

app.listen(port, function() {
  console.log("Listening on port: " + port);
});