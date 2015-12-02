
// alert("hi");

var toneClass = 
  { angry: "red"
  , happy: "light-blue"
  };


function fetchTone(callback){
  var http = new XMLHttpRequest();
  var url = "http://tone-analyzer-cs252.mybluemix.net/mood";
  // var params = 'text=' 
  //   + encodeURI("I pray my dick gets big as the eiffel tower, so I can fuck the world for 72 hours");
  var params = 'text=what+the+fuck';
  http.open("POST", url, true);

  //Send the proper header information along with the request
  //http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //http.setRequestHeader("text", 
  //    "I pray my dick gets big as the eiffel tower, so I can fuck the world for 72 hours");
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
      alert(http.responseText);
      //callback();
    }
  }
  http.send(params);
}

fetchTone(function(){});

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
      var textLen = node.innerText.length;
      // node.innerText += "#" + (textLen * 2000); // textLen;
      node.style.color = "rgb(" + textLen + ", 0, 0)";
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

