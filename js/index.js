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
var forestPlot = forestPlot();
plotDiv = d3.select('#plot');

// designate parameters of fake data (will eventually be array of effect size estimates)
var data = [
    {'author': 'Author 1',      // allow text input
    'year': '1999',
    'meanExp': 4,
    'sdExp': 2,
    'nExp': 50,
    'meanCtrl': 5,
    'sdCtrl': 1,
    'nCtrl': 50,
    'meanDiff': undefined,      // fill from input values
    'sdDiff': undefined,
    'weight': undefined         // fill from model specification
    },
    {'author': 'Author 2',
    'year': '2001',
    'meanExp': 2,
    'sdExp': 1,
    'nExp': 50,
    'meanCtrl': 8,
    'sdCtrl': 2,
    'nCtrl': 50,
    'meanDiff': undefined,
    'sdDiff': undefined,
    'weight': undefined
    },
    {'author': 'Author 3',
    'year': '2007',
    'meanExp': 4,
    'sdExp': 2.5,
    'nExp': 50,
    'meanCtrl': 3,
    'sdCtrl': 1,
    'nCtrl': 50,
    'meanDiff': undefined,
    'sdDiff': undefined,
    'weight': undefined
    },
];
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
    plotDiv.datum(data)
        .call(forestPlot);
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