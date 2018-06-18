exports.CreateChart = function(inputLocation, outputLocation, metaData) {
    var fs = require('fs');
    var d3 = require('d3');
    var jsdom = require('jsdom');

    if (!inputLocation)
        inputLocation = 'test.csv';

    if (!outputLocation)
        outputLocation = 'test.svg';

    if (!metaData)
        metaData = "test.meta";

  const { JSDOM } = jsdom;
  const { window } = new JSDOM();
  const { document } = (new JSDOM('')).window;
  global.document = document;
  window.d3 = d3.select(global.document);
  // set the dimensions and margins of the graph
  var margin = {
    top : 40,
    right : 20,
    bottom : 40,
    left : 70
  }, width = 960 - margin.left - margin.right, height = 520
    - margin.top - margin.bottom;
  var cssText = ".line {  fill: none;  stroke: steelblue;  stroke-width: 2px; }";

  // parse the date / time
  var parseTime = d3.timeParse("%s");

  // set the ranges
  var x = d3.scaleTime().range([ 0, width ]);
  var y = d3.scaleLinear().range([ height, 0 ]);

  // define the line
  var valueline = d3.line().x(function(d) {
    return x(d.date);
  }).y(function(d) {
    return y(d.close);
  });

  var svg = window.d3.select('body').append('div').attr(
    'class', 'container').append("svg").attr("width",
    width + margin.left + margin.right).attr("height",
    height + margin.top + margin.bottom).attr("xmlns",
    "http://www.w3.org/2000/svg").append("g")
    .attr(
          "transform",
                  "translate(" + margin.left + ","
                      + margin.top + ")");
  svg.append("style").attr("type", "text/css").text(cssText);

          // Get the data
  var rawdata = fs.readFileSync(inputLocation, 'utf8');
  var metadata = JSON.parse(fs.readFileSync(metaData, 'utf8'));
  var data = d3.csvParse(rawdata);
//console.log(data);
  var xlabel = data.columns[0];
  var ylabel = data.columns[1];

  data.forEach(function(d) {
//console.log(Object);
    array=Object.values(d);
    d.date = parseTime(Math.round(array[0]));
    d.close = +array[1];
  });

  x.domain(d3.extent(data, function(d) {
    return d.date;
  }));
  if (metadata.unit != "Percent") {
    y.domain([ 0, d3.max(data, function(d) {
      return d.close;
    }) ]);
  } else
    y.domain([ 0, 100 ]);

  svg.append("path").data([ data ]).attr("class", "line")
      .attr("d", valueline);
  // Add the X Axis
  svg.append("g").attr("transform",
      "translate(0," + height + ")").call(
      d3.axisBottom(x));
  // text label for the x axis
  svg.append("text").attr("x", 480).attr("y", 475).style(
      "text-anchor", "middle").text(xlabel);

  // Add the Y Axis
  svg.append("g").call(d3.axisLeft(y));

  svg.append("text").attr("transform", "rotate(-90)").attr(
      "y", 0 - margin.left).attr("x", 0 - (height / 2))
      .attr("dy", "1em").style("text-anchor", "middle")
      .text(ylabel);

  // add a title
  svg.append("text").attr("x", (width / 2)).attr("y",
      0 - (margin.top / 2)).attr("text-anchor", "middle")
      .style("font-size", "20px").style(
    "text-decoration", "underline").text(
  metadata.title);

  fs.writeFileSync(outputLocation, window.d3.select(
      '.container').html());
}
