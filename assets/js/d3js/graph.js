function graph(n,m,parsedData) {
	
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

var firstDate = parsedData[0][0]["dateObject"].setHours(0,0,0,0);
var lastDate = parsedData[0][parsedData[0].length-1]["dateObject"].setHours(0,0,0,0);

var colorArray = ["#aad","#6b6ecf","#556"];


var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .domain([firstDate, lastDate])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, yMax+1])
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
    .attr('stroke', function(d, i) { return colorArray[i]; });


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
  .style("fill", function(d) { return colorArray[d]; });

legend.append("text")
  .attr("x", width - 24)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function(d) { return parsedData["indexMapping"][d]; });

// Colour Legend - end

}