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

/* global
  SAMPLE_TEXT:false, umviz:false, d3:false, $:false,
  WORD_TRAIT_CORR_TYPE:false, HIGHLIGHT_ANIMATION_DURATION:false,
  COLOR_SCHEMA:false
*/

'use strict';

// DOM id for the tone visualization
var vizId = '#visualization';

/** @type {d3.map()} global word - category mapping data structure for highlighting interaction */
var WORD_TO_CATEGORY = d3.map(),
  CATEGORY_TO_WORD = d3.map();

var SYNONYM_HOPS = 1,
  SYNONYM_LIMITS = 6;

// Visualization
var toneGenomeViz = new umviz.models.toneGenome()
  .width(880)
  .height(190)
  .margin({ top: -15, right: 50, bottom: 100, left: 45 })
  .layoutMetric('percentile')
  .colorSchema(COLOR_SCHEMA);

// Visualization container
var mainViz = d3.select(vizId)
  .append('div')
  .classed('svg-container', true) //container class to make it responsive
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  //responsive SVG needs these 2 attributes and no width and height attr
  .attr('viewBox', '0 0 '+ toneGenomeViz.width() + ' ' + toneGenomeViz.height())
  //class to make it responsive
  .classed('svg-content-responsive', true);

// startup
$(document).ready(function() {
  var $text     = $('#textArea'),
    $loading    = $('#loading'),
    $analyzeBtn = $('.analyze-btn'),
    $results    = $('.results'),
    $jsonTab    = $('.json-div'),
    $outputText = $('.text-output-div'),
    $outputTextLabel = $('.text-output-label'),
    $error      = $('.error'),
    $errorMsg   = $('.errorMsg'),
    $visualization = $(vizId);

  var CURRENT_TEXT = null; // current analyzed text
  var CURRENT_TONE = null; // current results
  var REPLACEABLE = null;

  // set initial text
  $text.val(SAMPLE_TEXT);

  function onAPIError(xhr) {
    var error;
    try {
      error = JSON.parse(xhr.responseText || {});
    } catch(e) {}

    showError(error ? (error.error || error): '');
  }

  $analyzeBtn.click(function() {
    $loading.show();
    $results.hide();

    /**
     * send the data to the Tone Analyzer API to get words
     * matched with LIWC categories;
     */
    var text = $text.val();

    /*$.post('/mood', {'text': text })
      .done(function(response) {
        console.log(response);//JSON.stringify(response, null, 2));
      })
      .fail(onAPIError)
      .always (function(){
        $loading.hide();
        // scroll to bottom
        //$('.output-div')[0].scrollIntoView(true); // Boolean arguments

      });*/
    $.post('/tone', {'text': text })
      .done(function(response) {

        //prepare the data
        processData(response);
        response.id = 'root';
        CURRENT_TONE = response;
        // do the visualizations at the bottom
        doToneCheck(response, text);
      })
      .fail(onAPIError)
      .always (function(){
        $loading.hide();
      });
  });

  /**
   * Display an error or a default message
   * @param  {String} error The error
   */
  function showError(error) {
    var defaultErrorMsg = 'Error processing the request, please try again later.';
    $error.show();
    $errorMsg.text(error || defaultErrorMsg);
  }

  /**
   * Updates the visualization with the tone analyzer results
   *
   * @param  {Object} toneResponse: tone scores with linguistic evidence
   * @param  {String} analyzedText: analyzed text
   */
  function doToneCheck(toneResponse, analyzedText) {
    // If the list of words with any synonym in the system is available, keep it
    if (toneResponse.replaceable_words) {
      REPLACEABLE = {}; 
      toneResponse.replaceable_words.forEach(function(w) {
        REPLACEABLE[w.toLowerCase()] = true;
      });
    } else {
      REPLACEABLE = null; 
    }
    $results.show();

    CURRENT_TEXT = analyzedText;
    // normalize text
    var analyzedHtmlText = analyzedText.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');

    // this makes the colorful bar -- everything but this line takes care of the colorful text ********
    mainViz.datum(toneResponse).call(toneGenomeViz);

    // add higlight span html tags for all matched words:
    WORD_TO_CATEGORY.keys().forEach(function(wd) {
      var cates = WORD_TO_CATEGORY.get(wd);
      if (cates !== undefined && cates instanceof Array)
          analyzedHtmlText = addPropertySpan(analyzedHtmlText, wd, cates.join(' '));
    });


    $outputText.html(analyzedHtmlText);

    //add highlight css for different categories
    CATEGORY_TO_WORD.keys().reverse().forEach(function(ele) {
      var cateName;
      if (ele.indexOf('_' + WORD_TRAIT_CORR_TYPE.positive) > 0)
        cateName = ele.substring(0, ele.indexOf('_' + WORD_TRAIT_CORR_TYPE.positive));
      if (ele.indexOf('_' + WORD_TRAIT_CORR_TYPE.negative) > 0)
        cateName = ele.substring(0, ele.indexOf('_' + WORD_TRAIT_CORR_TYPE.negative));

      $('.' + ele).css('color', COLOR_SCHEMA[cateName]);
      $('.' + ele).css('border', "1px solid "+COLOR_SCHEMA[cateName]);
      $('.' + ele).css('padding', '0.2em 0.5em 0.2em 0.5em');
      $('.' + ele + ".replaceable").css('background-color', COLOR_SCHEMA[cateName]);
      $('.' + ele + ".replaceable").css('color', 'white');
    });
  }

  function addPropertySpan(data, search, stylecls) {
    var searchRgp = new RegExp('\\b(' + (search) + ')\\b', 'gi');
    var match, matchIdxs = []; //store matches in the original text.
    var counter = -1;

    while ((match = searchRgp.exec(CURRENT_TEXT)) !== null) {
      matchIdxs.push(match.index);
    }

    function replacer(matchstr) {
      counter++;
      var replaceable = REPLACEABLE && REPLACEABLE[matchstr.toLowerCase()];
      //console.log("replacer", matchstr, replaceable);
      return '<span class="matched-word ' + (replaceable ? 'replaceable ' : '') + stylecls + '" categories="' +
        stylecls + '" offset = "' + matchIdxs[counter] + '">' + matchstr + '</span>';
    }

    return data.replace(searchRgp, replacer);
  }

  function processData(traits) {
    if (traits.children === undefined) {
      //leaf node
      traits.mixedNode = traits.linguistic_evidence.length > 1 ? true : false;

      //use the score to calculate layout
      traits.linguistic_evidence.forEach(function(el) {

        if (el.correlation === WORD_TRAIT_CORR_TYPE.positive) {
          //extract trait-word mapping
          CATEGORY_TO_WORD.set(traits.id + '_' + WORD_TRAIT_CORR_TYPE.positive, el.words);
          //extract word-trait mapping
          if (el.words) {
            el.words.forEach(function(w) {
              var curCates = WORD_TO_CATEGORY.get(w);
              if (curCates === undefined)
                WORD_TO_CATEGORY.set(w, [traits.id + '_' + WORD_TRAIT_CORR_TYPE.positive]);
              else if ($.inArray(traits.id + '_' + WORD_TRAIT_CORR_TYPE.positive, curCates) === -1) {
                //not existing
                curCates.push(traits.id + '_' + WORD_TRAIT_CORR_TYPE.positive);
                WORD_TO_CATEGORY.set(w, curCates);
              }
            });
          }
        }

        if (el.correlation === WORD_TRAIT_CORR_TYPE.negative) {
          //extract trait-word mapping
          CATEGORY_TO_WORD.set(traits.id + '_' + WORD_TRAIT_CORR_TYPE.negative, el.words);
          //extract word-trait mapping
          el.words.forEach(function(w) {
            var curCates = WORD_TO_CATEGORY.get(w);
            if (curCates === undefined)
              WORD_TO_CATEGORY.set(w, [traits.id + '_' + WORD_TRAIT_CORR_TYPE.negative]);
            else
            if ($.inArray(traits.id + '_' + WORD_TRAIT_CORR_TYPE.negative, curCates) === -1) {
              //not existing
              curCates.push(traits.id + '_' + WORD_TRAIT_CORR_TYPE.negative);
              WORD_TO_CATEGORY.set(w, curCates);
            }
          });
        }
      });
    } else {
      //recursive do the data process
      traits.children.forEach(processData);
    }
  }

});
