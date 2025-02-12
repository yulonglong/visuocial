function wordCloud(parsedData) {

  var longWord = parsedData["words"].join(" ");

  function wordFrequency(txt){
    var wordArray = txt.split(/[\s?!,*'"]/);
    var newArray = [], wordObj;
    wordArray.forEach(function (word) {
      word = word.toLowerCase();
      if (word.indexOf("http") === 0) return;
      if (word === "rt") return;
      if (word.indexOf("@") === 0) return;
      if (word.length <= 1) return;
      if (stopwd[word] !== undefined) return;
      if (!(/[a-zA-Z]/.test(word))) return;

      word = word.replace(/[^0-9a-z]/gi, '');

      wordObj = newArray.filter(function (w){
        return w.text == word;
      });

      if (wordObj.length) {
        wordObj[0].size += 1;
      } else {
        newArray.push({text: word, size: 1});
      }
    });
    return newArray;
  }
  var wordArray = wordFrequency(longWord).sort(function(a,b){return a.size<b.size});

  executeWordCloud(wordArray);
}

function wordCloudTopic(parsedData) {
  var newArray = [];
  for (var key in parsedData) {
      // skip loop if the property is from prototype
      if (!parsedData.hasOwnProperty(key)) continue;

      var size = parsedData[key];
      newArray.push({text: key, size: size*1000}); // times 1000 to prevent size less than 1
  }
  var wordArray = newArray.sort(function(a,b){return a.size<b.size});
  
  executeWordCloud(wordArray);
}

function executeWordCloud(wordArray) {

  var fill = d3.scale.category20();

  var maxSize = 0;
  for(var i=0;i<wordArray.length;i++){
    if (parseInt(wordArray[i]["size"]) > maxSize && wordArray[i]["text"].length > 0) {
      maxSize = parseInt(wordArray[i]["size"]);
    }
  }
  var multiplier = 75/maxSize;


  var svg = d3.select('#d3canvas').append("svg")
      .attr("width", 960)
      .attr("height", 500)
      .call(responsivefy)
    .append("g")
      .attr("transform", "translate(480,250)");

  d3.layout.cloud().size([960, 500])
      .words(wordArray)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("raleway-bold")
      .text(function(d) { return d.text; })
      .fontSize(function(d) { return d.size*multiplier; })
      .on("end", draw)
      .start();

  function draw(words) {
      var cloud =  svg.selectAll("text")
        .data(words, function(d) { return d.text; });

      cloud.enter()
        .append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "raleway-semibold") 
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.text; });

      cloud.transition()
        .duration(600)
        .style("font-size", function(d) { return d.size + "px"; })
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("fill-opacity", 1);


      cloud.exit()
        .transition()
            .duration(200)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 1)
            .remove();
        
  }
}
