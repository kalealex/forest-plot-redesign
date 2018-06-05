var margin = {top: 20, right: 50, bottom: 20, left: 10};

var width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


// scales and axes
var xScale = d3.scaleLinear()
    .range([0,width]);

var yScale = d3.scaleLinear()
    .range([height,0]);

var xAxis = d3.axisBottom()
    .scale(xScale);

var yAxis = d3.axisRight()
    .scale(yScale);

// set up chart component
var qdp = quantileDotplot();
testVis = d3.select('#vis');

// designate parameters of fake data (will eventually be array of effect size estimates)
var data = [{
    'm': 0,
    'sd': 2,
    'n': 100
}];
// load data and initialize
// d3.csv("<datafile>.csv", initialize);

function initialize() {
// function initialize(error, data) {
//   if (error) return console.warn(error);
//   // format data for plot
//   data = formatData(data);
//   // update domains based on extrema
//   xScale.domain(d3.extent(data, function(d) { return d.x; }));
//   yScale.domain(d3.extent(data, function(d) { return d.y; }));
  
// eventually will call forest plot here

    // for now, call quantile dotplot
    testVis.datum(data[0])
        .call(qdp);
}

initialize();

// update charts
// function update(data) {
//     // extract overall time spent in each section
//     timeData = extractTimeBars(data);
//     bars.axisNominal(false);
//     timeBars.datum(timeData)
//         .call(bars);
// }