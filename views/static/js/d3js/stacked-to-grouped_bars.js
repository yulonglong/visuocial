function stackedToGroupedBars(n, m, parsedData) {
  // var n = 3; // number of layers
  // var  m = 45; // number of samples per layer
  var  stack = d3.layout.stack(),
    layers = stack(d3.range(n).map(function(currN) { 
      return parsedData[currN];
    })),
    yGroupMax = 2 + d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
    yStackMax = 2 + d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

  var color = d3.scale.category20();

  var margin = {top: 40, right: 10, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .domain(d3.range(m))
    .rangeRoundBands([0, width], .08);

  var y = d3.scale.linear()
    .domain([0, yStackMax])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(0)
    .tickPadding(6)
    .tickFormat(function(d) { return parsedData["date"][d]; })
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("d"));

  var svg = d3.select("#d3canvas").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(responsivefy)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var layer = svg.selectAll(".layer")
    .data(layers)
  .enter().append("g")
    .attr("class", "layer")
    .style("fill", function(d, i) { return color(i); });

  var rect = layer.selectAll("rect")
    .data(function(d) { return d; })
  .enter().append("rect")
    .attr("x", function(d) { return x(d.x); })
    .attr("y", height)
    .attr("width", x.rangeBand())
    .attr("height", 0);

  rect.transition()
    .delay(function(d, i) { return i * 10; })
    .attr("y", function(d) { return y(d.y0 + d.y); })
    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Posts");

  if (m <= 18) {
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  }
  else {
     var rotation = "-65";
     if (m > 50) rotation = "-75";

     svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")  
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate("+rotation+")" );
  }


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
 

  d3.selectAll("select").on("change", change);

  var timeout = setTimeout(function() {
  d3.select("option[value=\"grouped\"]").property("selected", true).each(change);
  }, 2000);

  function change() {
  clearTimeout(timeout);
  if (this.value === "grouped") transitionGrouped();
  else transitionStacked();
  }

  function transitionGrouped() {
    y.domain([0, yGroupMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
        .attr("width", x.rangeBand() / n)
      .transition()
        .attr("y", function(d) { return y(d.y); })
        .attr("height", function(d) { return height - y(d.y); });

     svg.selectAll("g .y.axis")
      .call(yAxis)
  }

  function transitionStacked() {
    y.domain([0, yStackMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return y(d.y0 + d.y); })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
      .transition()
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand());

    svg.selectAll("g .y.axis")
      .call(yAxis)
  }

  // Inspired by Lee Byron's test data generator.
  function bumpLayer(currN, m) {
    // function bump(a) {
    //   var x = 1 / (.1 + Math.random()),
    //       y = 2 * Math.random() - .5,
    //       z = 10 / (.1 + Math.random());
    //   for (var i = 0; i < n; i++) {
    //     var w = (i / n - y) * z;
    //     a[i] += x * Math.exp(-w * w);
    //   }
    // }

    var o = 0.01;
    var a = [], i;
    for (i = 0; i < m; ++i) a[i] = i-currN*2;
    // for (i = 0; i < m; ++i) a[i] = o + o * Math.random();
    // for (i = 0; i < 5; ++i) bump(a);
    // return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
    return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; })
  }
}