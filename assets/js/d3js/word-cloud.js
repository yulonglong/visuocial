function wordCloud(parsedData) {

  var longWord = parsedData["words"].join(" ");

  function wordFrequency(txt){
    var wordArray = txt.split(/[ ?!,*'"]/);
    var newArray = [], wordObj;
    wordArray.forEach(function (word) {
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


  var fill = d3.scale.category20c();

  var maxSize = 0;
  for(var i=0;i<wordArray.length;i++){
    if (parseInt(wordArray[i]["size"]) > maxSize && wordArray[i]["text"].length > 0) {
      maxSize = parseInt(wordArray[i]["size"]);
    }
  }
  var multiplier = 75/maxSize;

  d3.layout.cloud().size([960, 500])
      .words(wordArray)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("Impact")
      .text(function(d) { return d.text; })
      .fontSize(function(d) { return d.size*multiplier; })
      .on("end", draw)
      .start();

  function draw(words) {
    d3.select("#d3canvas").append("svg")
        .attr("width", 960)
        .attr("height", 500)
        .call(responsivefy)
      .append("g")
        .attr("transform", "translate(480,250)")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact") 
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
        
  }
}
