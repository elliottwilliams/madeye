'use strict';

alert("by");

var Color;
var Label;
var Annotate;

var toneToColor = 
  { neutral:     "gray"
  , happy:       "chartreuse"
  , excited:     "orange"
  , sad:         "darkslateblue"
  , angry:       "red"
  , frustrated:  "purple"
  }

function hitApi(endpoint, text, callback){
  var http = new XMLHttpRequest();
  var url = "https://tone-analyzer-cs252.mybluemix.net/" + endpoint;
  var params = 'text=' + encodeURIComponent(text).replace(/%20/g, '+');
  http.open("POST", url, true);

  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
      //alert(http.responseText);
      callback(http);
    }
  }
  http.send(params);
}
function fetchMood(text, callback){
  hitApi("mood", text, callback);
}
function fetchToneAnalysis(text, callback){
  hitApi("tone", text, callback);
}
// s = "I pray my dick gets big as the eiffel tower, so I can fuck the world for 72 hours";
// fetchMood(s, function(response){ alert(response.responseText); } );



// returns a page type item t with three functions:
//   * p.matches :: Node -> Bool
//   * p.matchFails :: Node -> Bool
//   * p.color :: Node -> Void
function getPageType(){
  return regularPage;
}

function colorTraverse(node){
  if(pageType.matches(node)){ //if the node is what we want to color, color it
    pageType.color(node);
  }else if(!pageType.matchFails(node)){ //if the node isn't the goal, but it doesn't fail
    var children = node.children;
    for(var i=0; i < children.length; i++){
      colorTraverse(children[i]);
    }
  }
}



//
//Page specific supports
//

var defaultMatch = 
  function(node){
    // alert(node.nodeName);
    if(node.nodeName == "P" && node.innerText.length > 30){
        //alert(node.textContent);
        return true;
    }else{
        return false;
    }
  };

var defaultFail = 
  function(node){
    return false;
  }

var defaultColor = 
  function(node){
    // node.style.cssText = "color: green !important";
    // node.style.color = 'red';
    var text = node.innerText;
    fetchMood(text, function(response){
      var mood = JSON.parse(response.responseText).mood;
      //alert(mood + ":" + toneToColor[mood]);
      if(Color){
        node.style.color = toneToColor[mood];
      }
      if(Label){
        var annotate = "<div class='tone-tinter-label'>((" + mood + "))</div>";
        //alert(annotate);
        node.innerHTML = annotate + node.innerHTML;
      }
    });
  };

var regularPage = 
  { matches: defaultMatch
  , matchFails: defaultFail
  , color: defaultColor
  }



function lineMatch(text, locat){
  var lines = text.split("\n");
  var loc = new String(locat);
  for(var i=0; i<lines.length; i++){
    if(lines[i].length > 0 
        && loc.match(new RegExp(lines[i]))){
      return true;
    }
  }
  return false;
}


//
//launch the stuff
//
var pageType = getPageType();

// alert("x");
chrome.storage.sync.get
( { tone_tinter_color: true
  , tone_tinter_label: false
  , tone_tinter_annotate: false
  , tone_tinter_sites: "twitter.com"
  }
, function(tone) {
    Color = tone.tone_tinter_color;
    Label = tone.tone_tinter_label;
    Annotate = tone.tone_tinter_annotate;
    // alert(tone.tone_tinter_sites);
    if(lineMatch(tone.tone_tinter_sites, window.location)){
      // alert("hi");
      colorTraverse(document.body);
    }
  }
);
