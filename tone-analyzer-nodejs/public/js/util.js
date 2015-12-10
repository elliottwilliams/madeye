/* jshint unused:false, curly:false */
/* globals randomColor */

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
  return sum;
}

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

function produceToneColoring(data) {
    // given: list of emotions, each a list of words
    // output a list of emotions and color, and a list of words by color
    var output = {
        emotions: {},
        words: {} 
    };

    data.children.forEach(function(tone) {
        tone.children.forEach(function(emotion) {
            var color = randomColor({
                luminosity: 'dark'
            });
            output.emotions[emotion.name] = {
                name: emotion.name,
                color: color,
                words: emotion.linguistic_evidence[0].words,
                count: emotion.word_count
            };

            emotion.linguistic_evidence[0].words.forEach(function(word) {
                if (word.length > 2) {
                    output.words[word] = color;
                }
            });
        });
    });

    return output;
}

