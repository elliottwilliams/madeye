function getMoodScore(e){if(void 0===e.children){switch(e.name){case"Cheerfulness":return 50*e.normalized_score;case"Negative":return-50*e.normalized_score;case"Anger":return-50*e.normalized_score;case"Analytical":return-10*e.normalized_score;case"Confident":return 25*e.normalized_score;case"Tentative":return-25*e.normalized_score;case"Openness":return 17*e.normalized_score;case"Agreeableness":return 17*e.normalized_score;case"Conscientiousness":return 17*e.normalized_score}return 0}var r=0;for(var n in e.children)r+=getMoodScore(e.children[n]);return r}function getMood(e){var r=getMoodScore(e),n=r/5;return n>=-1&&1>=n?"Neutral":n>0?12>=n?"Happy":"Excited":n>=-12?"Sad":"Angry"}function produceToneColoring(e){var r={emotions:{},words:{}};return e.children.forEach(function(e){e.children.forEach(function(e){var n=randomColor({luminosity:"dark"});r.emotions[e.name]={name:e.name,color:n,words:e.linguistic_evidence[0].words,count:e.word_count},e.linguistic_evidence[0].words.forEach(function(e){e.length>2&&(r.words[e]=n)})})}),r}