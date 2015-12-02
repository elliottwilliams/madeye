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
  extend    = require('util')._extend,
  watson    = require('watson-developer-cloud');

// Bootstrap application settings
require('./config/express')(app);

var credentials = extend({
  version: 'v2-experimental',
  username: '<username>',//TODO: <username>
  password: '<password>'//TODO: <password>
}, bluemix.getServiceCreds('tone_analyzer'));


// Create the service wrapper
var toneAnalyzer = watson.tone_analyzer(credentials);

// render index page
app.get('/', function(req, res) {
  res.render('index');
});

app.post('/mood', function(req, res, next) {
  toneAnalyzer.tone(req.body, function(err, data) {
    if (err) {
      return next(err);
    } else {
      // Now let's figure out what mood to send
      return res.json({ mood: getMood(data) });
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


function getMood(data) {
  var score = getMoodScore(data);
  var s = score / 5;
  
  if (s >= -1 && s <= 1) {
    return "Neutral";
  } else if (s > 0) {
    if (s <= 12)
      return "Happy";
    else
      return "Excited";
  } else {//if (s < 0) {
    if (s >= -12)
      return "Sad";
    else
      return "Angry";
  }
}

function getMoodScore(data) {
  if (data.children === undefined) {
    switch (data.name) {
      case "Cheerfulness":
        return 50 * data.normalized_score;
      case "Negative":
        return -50 * data.normalized_score;
      case "Anger":
        return -50 * data.normalized_score;
      case "Analytical":
        return -10 * data.normalized_score;
      case "Confident":
        return 25 * data.normalized_score;
      case "Tentative":
        return -25 * data.normalized_score;
      case "Openness":
        return 17 * data.normalized_score;
      case "Agreeableness":
        return 17 * data.normalized_score;
      case "Conscientiousness":
        return 17 * data.normalized_score;
    }
    return 0;
  }

  var sum = 0.0;
  for (var s in data.children) {
    sum += getMoodScore(data.children[s]);
  }
  console.log(sum);
  return sum;
}

