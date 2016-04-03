function donut(n, parsedData) {
	var width = 960,
    height = 500 - 29; // adjust for height of input bar div

var color = d3.scale.category20();

// draw and append the container
var svg = d3.select("#d3canvas").append("svg")
  .attr("width", width).attr("height", height)
  .call(responsivefy);

// set the thickness of the inner and outer radii
var min = Math.min(width, height);
var oRadius = min / 2 * 0.9;
var iRadius = min / 2 * 0.7;

// construct default pie laoyut
var pie = d3.layout.pie().value(function(d){ return d; }).sort(null);

// construct arc generator
var arc = d3.svg.arc()
  .outerRadius(oRadius)
  .innerRadius(iRadius);

// creates the pie chart container
var g = svg.append('g')
  .attr('transform', function(){
    if ( window.innerWidth >= 960 ) var shiftWidth = width / 2;
    if ( window.innerWidth < 960 ) var shiftWidth = width / 3;
    return 'translate(' + shiftWidth + ',' + height / 2 + ')';
  });

// generate random data
var data = d3.range(15);

// enter data and draw pie chart
var path = g.datum(data).selectAll("path")
  .data(pie)
  .enter().append("path")
    .attr("class","piechart")
    .attr("fill", function(d,i){ return color(i); })
    .attr("d", arc)
    .each(function(d){ this._current = d; });

function render(){
	data = [];
	for(var i=0;i<n;i++){
		data.push(parsedData["cumulativeFreq"][i]);
	}

  // add transition to new path
  g.datum(data).selectAll("path").data(pie).transition().duration(1000).attrTween("d", arcTween)

  // add any new paths
  g.datum(data).selectAll("path")
    .data(pie)
  .enter().append("path")
    .attr("class","piechart")
    .attr("fill", function(d,i){ return color(i); })
    .attr("d", arc)
    .each(function(d){ this._current = d; })

  // remove data not being used
  g.datum(data).selectAll("path")
    .data(pie).exit().remove();

  // Colour Legend - begin
  var legend = svg.selectAll(".legend")
      .data(d3.range(n).reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) { return color(i); });

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return parsedData["indexMapping"][d] + " : " + parsedData["cumulativeFreq"][d]; });

  // Colour Legend - end
}

render();
// setInterval(render,2000);

function makeData(size){
  return d3.range(size).map(function(item){
   return Math.random()*100;
  });
};

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}
}