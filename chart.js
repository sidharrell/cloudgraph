var fs = require('fs');
var d3 = require('d3');
var jsdom = require('jsdom');

module.exports = function(outputLocation, graphTitle) {

    if (!outputLocation)
        outputLocation = 'test.svg';

    if (!graphTitle)
        graphTitle = "i-fa9159de CPUUtilization";
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
    var rawdata = fs.readFileSync('file1', 'utf8');
    var data = d3.csvParse(rawdata);

    var xlabel = data.columns[0];
    var ylabel = data.columns[1];

    data.forEach(function(d) {
        array=Object.values(d);
        d.date = parseTime(Math.round(array[0]));
        d.close = +array[1];
console.log(d.date);
console.log(d.close);
    });

    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));
    y.domain([ 0, d3.max(data, function(d) {
        return d.close;
    }) ]);

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
    graphTitle);

    fs.writeFileSync(outputLocation, window.d3.select(
            '.container').html());
}


if (require.main === module) {
    module.exports();
}
