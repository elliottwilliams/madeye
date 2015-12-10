/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'),
  app       = express(),
  bluemix   = require('./config/bluemix'),
  watson    = require('watson-developer-cloud'),
  fs        = require('fs'),
  extend    = require('util-extend'),
  ibmdb     = require('ibm_db');

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

var dbcreds = JSON.parse(process.env.VCAP_SERVICES)['sqldb'][0]['credentials'];
var dbConnString = "DRIVER={DB2};DATABASE="+dbcreds.db+
                       ";UID="+dbcreds.username+
                       ";PWD="+dbcreds.password+
                       ";HOSTNAME="+dbcreds.host+
                       ";port="+dbcreds.port;

app.use(function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

// render index page
app.get('/', function(req, res) {
  res.render('index');
});

app.post('/mood', function(req, res, next) {
  toneAnalyzer.tone(req.body, function(err, data) {
    if (err) {
      return next(err);
    } else {

      //var text = '{ "text": "' + req.body.text + '",' + makeJSON(data) + '"emotion":<put stuff here> }'; 
      //return res.send(text)

      ibmdb.open(dbConnString, function(err, conn) {
  
        if(err) {
          console.error("db connection error: ", err.message);
          console.log("Not surprisingly, we failed to connect to the db");
          return;
        }

        var rows = conn.querySync("SELECT * FROM data");

        console.log("STUFF: " + rows[0].ID);
        // For each of our example data
        var minInd = 0;
        var minVal = 1000000;
        for (var r in rows) {
          var compare = compareMoods(data, rows[r]);
          if (compare < minVal) {
            minInd = r;
            minVal = compare;
            //console.log(obj.data[s].emotion);
          }
        }
        conn.closeSync();
        return res.json({ mood: rows[minInd].EMOTION });
      });
    }
  })
})

app.post('/tone', function(req, res, next) {
  toneAnalyzer.tone(req.body, function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);
  });
});

app.get('/synonyms', function(req, res, next) {
  toneAnalyzer.synonym(req.query, function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);
  });
});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);

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
