'use strict';

var express = require('express'),
  app       = express(),
  bluemix   = require('./config/bluemix'),
  watson    = require('watson-developer-cloud'),
  fs        = require('fs'),
  http      = require('http'),
  extend    = require('util-extend'),
  ibmdb     = require('ibm_db');

// Secrets

// Bootstrap application settings
require('./config/express')(app);

var credentials = extend({
  version: 'v2-experimental',
  username: '<username>',//TODO: <username>
  password: '<password>'//TODO: <password>
}, bluemix.getServiceCreds('tone_analyzer'));

try {
    fs.accessSync('./config/emw.js');
    var emw = require('./config/emw');
    credentials = extend(credentials, emw.bluemix);
    console.log('using emw credentials');
} catch (e) {}

// Create the service wrapper
var toneAnalyzer = watson.tone_analyzer(credentials);

function csrfEnable(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    next();
}
// Get the db credentials all set up so we can connect.
var dbcreds = JSON.parse(process.env.VCAP_SERVICES)['sqldb'][0]['credentials'];
var dbConnString = "DRIVER={DB2};DATABASE="+dbcreds.db+
                       ";UID="+dbcreds.username+
                       ";PWD="+dbcreds.password+
                       ";HOSTNAME="+dbcreds.host+
                       ";port="+dbcreds.port;

// render index page
app.get('/', function(req, res) {
  res.render('index');
});

// Our actual important endpoint. This is mainly what our extension uses.
app.post('/mood', csrfEnable, function(req, res, next) {
  toneAnalyzer.tone(req.body, function(err, data) {
    if (err) {
      return next(err);
    } else {
      ibmdb.open(dbConnString, function(err, conn) {
  
        if(err) {
          console.error("db connection error: ", err.message);
          console.log("Not surprisingly, we failed to connect to the db");
          return;
        }

        var rows = conn.querySync("SELECT * FROM data");

        // For each of our example data
        var minInd = 0;
        var minVal = 1000000;
        for (var r in rows) {
          // Compare and find the closest match.
          var compare = compareMoods(data, rows[r]);
          if (compare < minVal) {
            minInd = r;
            minVal = compare;
          }
        }
        conn.closeSync();
        return res.json({ mood: rows[minInd].EMOTION });
      });
    }
  })
})

// Just in case we need to get the tone of words.
app.post('/tone', csrfEnable, function(req, res, next) {
  toneAnalyzer.tone(req.body, function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);
  });
});

// Just in case we need to get synonyms.
app.get('/synonyms', csrfEnable, function(req, res, next) {
  toneAnalyzer.synonym(req.query, function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);
  });
});

app.get('/read', csrfEnable, function(req, res, next) {
    var url = req.query.url;
    console.log(url);
    if (!url) {
        return res.status(400).send('No url passed');
    }
    http.get('http://fuckyeahmarkdown.com/go/?u=' + encodeURIComponent(url) +
            '&read=1&md=1', function(read) {

        var body = '';
        read.on('data', function(d) {
            body += d;
        }).on('end', function() {
            res.status(read.statusCode);
            res.set('Content-Type', 'application/json');
            res.end(body);
        });

    }).on('error', function(err) {
        res.status(500).send(err);
    });
});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);

// Helper methods for sorting through moods entries and comparing them.
function compareMoods(data, comp) {
  if (data.children === undefined) {
    switch (data.name) {
      case "Cheerfulness":
        return Math.abs(data.normalized_score - comp.CHEERFULNESS);
      case "Negative":
        return Math.abs(data.normalized_score - comp.NEGATIVE);
      case "Anger":
        return Math.abs(data.normalized_score - comp.ANGER);
      case "Analytical":
        return Math.abs(data.normalized_score - comp.ANALYTICAL);
      case "Confident":
        return Math.abs(data.normalized_score - comp.CONFIDENT);
      case "Tentative":
        return Math.abs(data.normalized_score - comp.TENTATIVE);
      case "Openness":
        return Math.abs(data.normalized_score - comp.OPENNESS);
      case "Agreeableness":
        return Math.abs(data.normalized_score - comp.AGREEABLENESS);
      case "Conscientiousness":
        return Math.abs(data.normalized_score - comp.CONSCIENTIOUSNESS);
    }
    return 0;
  }

  var sum = 0.0;
  for (var s in data.children) {
    sum += compareMoods(data.children[s], comp);
  }
  return sum;
}
