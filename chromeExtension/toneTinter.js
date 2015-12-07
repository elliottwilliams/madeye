
// alert("hi");

var toneToColor = 
  { Neutral:  "gray"
  , Happy:    "chartreuse"
  , Excited:  "orange"
  , Sad:      "darkslateblue"
  , Angry:    "red"
  }

  //http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  // var params = 'text=' 
  //   + encodeURI("I pray my dick gets big as the eiffel tower, so I can fuck the world for 72 hours");
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

var regularPage = 
  { matches: function(node){
      // alert(node.nodeName);
      if(node.nodeName == "P"){
        //alert(node.textContent);
        return true;
      }else{
        return false;
      }
    }
  , matchFails: function(node){
      return false;
    }
  , color: function(node){
      // alert("coloring");
      // node.style.color = "green";
      // node.style.cssText = "color: green !important";
      var text = node.innerText;
      // node.innerText += "#" + (textLen * 2000); // textLen;
      //node.style.color = "rgb(" + text.length + ", 0, 0)";
      fetchMood(text, function(response){
          mood = JSON.parse(response.responseText).mood;
          //alert(mood + ":" + toneToColor[mood]);
          node.style.color = toneToColor[mood];
      });
    }
  }


// returns a page type item t with three functions:
//   * p.matches :: Node -> Bool
//   * p.matchFails :: Node -> Bool
//   * p.color :: Node -> Void
function getPageType(){
  return regularPage;
}

var pageType = getPageType();

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

colorTraverse(document.body);

