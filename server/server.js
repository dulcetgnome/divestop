var express = require('../node_modules/express');
var parser = require('../node_modules/body-parser');
var path = require('path');
var db = require('./db.js');
var app = express();
var port = process.env.PORT || 3000;

var qs = require('querystring');
var bodyParser = require('body-parser');
var colors = require('colors');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var request = require('request');

var config = require('./config');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/* Middleware */
app.use(parser.json());

/* Static File Serving */
app.use(express.static(path.join(__dirname, '../client')));



/* Routes for general user */
app.get('/', function(req, res) {
  res.sendStatus(200);
});

app.get('/api/sites/:location', function(req, res) {
  // location in url is formatted as api/sites/3.456-50.267
  var location = req.params.location.split('_');
  var coordinates = [location[0], location[1]]; 
  // regex /\%20/g, ' '
  // pass down coordinates to db for query
  db.search(function(sites) {
    res.json(sites);
  }, coordinates);
});

app.get('/api/sites', function(req, res) {
  db.search(function(sites) {
    res.json(sites);
  }, [0,0]);
});

app.post('/api/sites', function(req, res) {
  db.addSites(function() {
    res.sendStatus(201);
  }, req.body);
});

app.get('/api/keys', function(req, res) {
    res.json({
      // 'X-Parse-Application-Id': process.env['X-Parse-Application-Id'],
      // 'X-Parse-REST-API-Key': process.env['X-Parse-REST-API-Key']
      'X-Parse-Application-Id': 'jAY20TrvBGo3rwdhc3UTvJnr9wbnmgbGAE5lryDv',
      'X-Parse-REST-API-Key': 'pE7A3TXUbzC3C3NQPPT22FR4VSQZAnI0U21t5zcC'
    });
});
/* Routes for logged in user */
// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}
app.use(express.static(path.join(__dirname, '../client')));

function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

function createJWT(user) {
  var payload = {
    sub: user.fb_id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

app.get('/api/me', ensureAuthenticated, function(req, res) {
  db.findUser(req.user, function (user) {
    user = user[0];
    res.send({
      displayName: user.first_name + ' ' + user.last_name,
      picture: 'https://graph.facebook.com/v2.3/' + user.fb_id + '/picture?type=large'
    });
  });
});

app.put('/api/me', ensureAuthenticated, function(req, res) {
  res.send()
});

// Log in Facebook
app.post('/auth/facebook', function(req, res) {
  var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };
  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      // Step 3b. Create a new user account or return an existing one.
      db.findUser(profile.id, function(existingUser) {
        if (existingUser.length !== 0) {
          var token = createJWT(existingUser[0]);
          return res.send({ token: token });
        }
        var fbdata = {
          fb_id: profile.id,
          first_name: profile.name.split(' ')[0],
          last_name: profile.name.split(' ')[1]
        }
        db.addUser(fbdata, function (newUser) {
          console.log('newUser', newUser)
          var token = createJWT(newUser[0]);
          return res.send({ token: token });
        });
       });
    });
  });
});


// Creates table
db.droptable(function () {
  db.createTables();
});


// db.wipeDatabase();
/* Auth stuff */

app.listen(port, function() {
  console.log("Listening on port: " + port);
});

exports.app = app;