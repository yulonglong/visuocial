function graph(n,m,parsedData) {
  var color = d3.scale.category20();
	
// var data = [
  // [new Date(2001, 0, 1), 1],
  // [new Date(2001, 1, 1), 2],
  // [new Date(2001, 2, 1), 2],
  // [new Date(2001, 3, 1), 3],
  // [new Date(2001, 4, 1), 4],
  // [new Date(2001, 5, 1), 5]
// ];
var data = [[],[],[]];
var yMax = 2;
for(var nIndex=0;nIndex<n;nIndex++){
	for(var i=0;i<parsedData[nIndex].length;i++){
		data[nIndex].push([parsedData[nIndex][i]["dateObject"].setHours(0,0,0,0), parsedData[nIndex][i]['freq']]);
		if (yMax < parseInt(parsedData[nIndex][i]['freq'])) {
			yMax = parseInt(parsedData[nIndex][i]['freq']);
		}
	}
}
yMax += 2;

var firstDate = parsedData[0][0]["dateObject"].setHours(0,0,0,0);
var lastDate = parsedData[0][parsedData[0].length-1]["dateObject"].setHours(0,0,0,0);


var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .domain([firstDate, lastDate])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, yMax])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return x(d[0]); })
    .y(function(d) { return y(d[1]); });

var svg = d3.select("#d3canvas").append("svg")
    .data(data)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(responsivefy)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

svg.selectAll(".line")
    .data(data)
  .enter().append("path")
    .attr("class", "line")
    .attr("d", line)
    .attr('stroke', function(d, i) { return color(i); });

// Animation begin
/* Add 'curtain' rectangle to hide entire graph */
var curtain = svg.append('rect')
.attr('x', -1 * width)
.attr('y', -1 * height)
.attr('height', height)
.attr('width', width)
.attr('class', 'curtain')
.attr('transform', 'rotate(180)')
.style('fill', '#ffffff')

/* Optionally add a guideline */
var guideline = svg.append('line')
.attr('stroke', '#333')
.attr('stroke-width', 0)
.attr('class', 'guide')
.attr('x1', 1)
.attr('y1', 1)
.attr('x2', 1)
.attr('y2', height)

/* Create a shared transition for anything we're animating */
var t = svg.transition()
.delay(50)
.duration(1000)
.ease('linear')
.each('end', function() {
  d3.select('line.guide')
    .transition()
    .style('opacity', 0)
    .remove()
});

t.select('rect.curtain')
.attr('width', 0);
t.select('line.guide')
.attr('transform', 'translate(' + width + ', 0)')
// Animation end

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
    .style("fill", function(d, i) { return color(n-1-i); });

legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return parsedData["indexMapping"][d]; });

// Colour Legend - end
}