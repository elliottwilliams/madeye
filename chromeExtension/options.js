//insert site
function insert(){
}

// Saves options to chrome.storage
function save_options() {
  var color = document.getElementById('color').checked;
  var label = document.getElementById('label').checked;
  // var annotate = document.getElementById('annotate').checked;
  var sites = document.getElementById('sites').value;
  chrome.storage.sync.set
  ( { tone_tinter_color: color
    , tone_tinter_label: label
    // , tone_tinter_annotate: annotate
    , tone_tinter_sites: sites 
    }
  , function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout
      ( function(){
          status.textContent = '';
        }
      , 1500
      );
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get
  ( { tone_tinter_color: true
    , tone_tinter_label: false
    // , tone_tinter_annotate: false
    , tone_tinter_sites: "twitter.com"
    }
  , function(tone) {
      document.getElementById('color').checked = tone.tone_tinter_color;
      document.getElementById('label').checked = tone.tone_tinter_label;
      // document.getElementById('annotate').checked = tone.tone_tinter_annotate;
      document.getElementById('sites').value = tone.tone_tinter_sites;
    }
  );
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
