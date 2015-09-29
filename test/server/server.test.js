var expect = require('chai').expect;
var request = require('supertest');   // LOOK INTO HOW THIS IS USED!
app = require('../server/index.js');

describe('RESTful api', function () {

  it('responds to GET requests at `/`', function (done) {

    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('responds to GET requests at `/api/sites` by returning data for all sites', function() {

    request(app)
      .get('/api/sites')
      // .expect(XXX)                  // DETERMINE WHAT THIS SHOULD EXPECT
      .end(function (err, res) {
        if (err) return done(err);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('location');
        done();
      });
  });

  it('responds to POST requests at `/api/sites`' , function (done) {

    var data = {
      site: 'Martins Marina',
      location: 'Fiji',
      coordinates: '45, 65',
      max_depth: 35,
      gradient: '25d',
      feature: ['coral', 'shipwreck'],
      type: ['clown fish', 'lion fish'],
      description: "spectacularly beautify dive spot!",
      comments: "a must see if you are in the area"
    };

    request(app)
      .post('/api/sites')
      .send(JSON.stringify(data))
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
      });

    request(app)
      .get('/api/sites/:fiji')
      // .expect(XXX)                  // DETERMINE WHAT THIS SHOULD EXPECT
      .end(function (err, res) {
        if (err) return done(err);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('location');
        res.body[0].location.should.equal('fiji');  // Make sure "Fiji" gets converted to lower case!
        done();
      });

  });

  it('responds to GET requests at `/api/sites/:location` by returning site data for specified location', function() {

    request(app)
      .get('/api/sites/:fiji')
      // .expect(XXX)                  // DETERMINE WHAT THIS SHOULD EXPECT
      .end(function (err, res) {
        if (err) return done(err);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('location');
        res.body[0].location.should.equal('fiji');  // Make sure "Fiji" gets converted to lower case!
        done();
      });
  });

});