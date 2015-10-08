var expect = require('chai').expect;
var request = require('supertest');
var app = require('../../server/server.js').app;

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

  xit('responds to GET requests at `/api/sites` by returning data for all sites', function (done) {

    request(app)
      .get('/api/sites')
      .end(function (err, res) {
        if (err) return done(err);
        expect(200);
        expect('Content-Type', /json/);
        /* Several sites coming back */
        done();
      });
  });

  xit('responds to POST requests at `/api/sites`' , function (done) {

    var data = {
      name: 'Martins Marina',
      location: 'Fiji',
      coordinates: { 'lat': 45.345, 'lng': 65.154 },
      maxDepth: 35,
      gradient: '25d',
      features: ['coral', 'shipwreck'],
      aquaticLife: ['clown fish', 'lion fish'],
      description: "spectacularly beautify dive spot!",
      comments: "a must see if you are in the area",
      photos: ["some url"]
    };

    request(app)
      .post('/api/sites')
      .send(data)
      .expect(201)
      .end(function (err, res) {
        if (err) return done(err);
        request(app)
          .get('/api/sites/')
          .end(function (err, res) {
            if (err) return done(err);
            expect(200);
            expect('Content-Type', /json/);
            expect(res.body[4].location, 'fiji');
            done();
          });
      });

  });

  xit('responds to GET requests at `/api/sites/:location` by returning site data for specified location', function (done) {

    request(app)
      .get('/api/sites/fiji')
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body[0].location, 'fiji');
        done();
      });
  });

});