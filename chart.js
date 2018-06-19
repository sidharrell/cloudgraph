// export the CreateChart function w/ 3 parameters
//
exports.CreateChart = function(inputLocation, outputLocation, metaData) {

// Prerequisites
// run 'npm install' in the root folder.
    var fs = require('fs');
    var d3 = require('d3');
    var jsdom = require('jsdom');

// provide defaults
    if (!inputLocation)
        inputLocation = 'test.csv';

    if (!outputLocation)
        outputLocation = 'test.svg';

    if (!metaData)
        metaData = "test.meta";

// load jsdom w/ the handle window.d3 on it.
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

  // get a handle on d3's timeParse function for parsing the date / time
  var parseTime = d3.timeParse("%s");

  // get handles for functions for setting the ranges
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

// pull the x and y labels from the column headers in the csv
  var xlabel = data.columns[0];
  var ylabel = data.columns[1];


// parse the raw data into an array of key-value pairs of objects
  data.forEach(function(d) {
    array=Object.values(d);
    d.date = parseTime(Math.round(array[0]));
    d.close = +array[1];
  });

// define the range of values on the x axis
  x.domain(d3.extent(data, function(d) {
    return d.date;
  }));

// define the range of values on the y axis
  if (metadata.unit != "Percent") {
    y.domain([ 0, d3.max(data, function(d) {
      return d.close;
    }) ]);
  } else
    y.domain([ 0, 100 ]);

// draw the line
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

// write out to the file
  fs.writeFileSync(outputLocation, window.d3.select(
      '.container').html());
}
