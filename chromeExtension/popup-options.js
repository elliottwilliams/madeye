'use strict';

//alert("hi");

var Color = true;
var Label = true;
var Annotate = true;

// options = chrome.extension.getURL("options.html");

var optionsHTML
  = ' <div id="tone-tinter-options">'
  + '   <label> Color page elements by tone </label>'
  + '   <input id="tone-tinter-color" name="Color" value="Color">'
  + '   <label> Label tone explicitly </label>'
  + '   <input id="tone-tinter-label" name="Color" value="Color">'
  + '   <label> Inject tone annotations </label>'
  + '   <input id="tone-tinter-annotations" name="Color" value="Color">'
  + '   <div id="tone-tinter-reload">reload</div>'
  + ' </div>';

var options = document.createElement("div");
options.innerHTML = optionsHTML;
//alert(options);
document.body.appendChild(options);
document.getElementById("ddcd").appendChild(options);
