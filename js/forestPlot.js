/*
 * REUSABLE CHART COMPONENTS
 * 
 */
function forestPlot() {

  var margin = { 'top': 10, 'right': 10, 'left': 20, 'bottom': 10 },
    width = 600,
    height = 900,
    selection,
    div,
    table,
    data,
    dataExtent,
    noEffectLine,
    noEffectX,
    noEffectY = [0, 0], // dummy values
    qdp,
    dotRadius,
    nRows,
    modelSpec = 'fixed effects', // need drop down menu with options: 'fixed effects', 'random effects', 'grouped fixed effects', 'grouped random effects'
    mode = 'describe', // need drop down menu with options: 'describe', 'aggregate', 'predict'
    rows,
    columns = [
      { head: 'Author', cl: 'center label',
        html: function(row) { return row.author; } },
      { head: 'Year', cl: 'center',
        html: function(row) { return row.year; } },
      { head: 'Mean', cl: 'num',   // experimental condition
        html: function(row) { return row.meanExp; } },
      { head: 'SD', cl: 'num',
        html: function(row) { return row.sdExp; } },
      { head: 'N', cl: 'num',
        html: function(row) { return row.nExp; } },
      { head: 'Mean', cl: 'num',  // control condition
        html: function(row) { return row.meanCtrl; } },
      { head: 'SD', cl: 'num',
        html: function(row) { return row.sdCtrl; } },
      { head: 'N', cl: 'num',
        html: function(row) { return row.nCtrl; } },
      { head: 'Mean', cl: 'num estimates',  // effect size
        html: function(row) { return row.meanDiff; } },
      { head: '95% CI', cl: 'center',
        html: function(row) { 
          var CI = confint(row);
          return '(' + CI[0] + ', ' + CI[1] + ')'; 
        }
      },
      { head: 'N', cl: 'num',
        html: function(row) { return row.nDiff } },
      { head: 'Weight', cl: 'num',
        html: function(row) { return row.weight; } 
      },
      { head: 'Forest Plot', cl: 'chart',
        html: function(row, i) { 
          // wait until the DOM is ready so that td.chart exists
          $(function() {
            // select the current row's table data cell classed 'chart'
            var currRow = document.getElementById('r' + i)
            var chart = currRow.querySelector('.chart');
            // set width of quantile dotplots based on table
            qdp.width(chart.width);
            // set the x extent of the quantile dotplots based on all the data so that all dotplots plots are on a common axis
            qdp.xExtent(dataExtent);
            // toggle axes
            if (i === nRows) {
              qdp.hideAxes(false);
            } else {
              qdp.hideAxes(true);
            }
            // append svg to td.chart, bind row data, call plotting function
            var svg = d3.select(chart).append('svg')
              .attr('class', 'qdp')
              .datum(row)
              .call(qdp);
            // get coordinates for no effect line (padding is 5 for td, 2 for svg)
            var chartBounds = d3.select(chart).node().getBoundingClientRect();
            if (i === 0) {
              noEffectX = qdp.xZero() + chartBounds.left + 11;
              noEffectY[0] = chartBounds.top - 12;
            }
            else if (noEffectY[1] < chartBounds.top + qdp.height()) {
              noEffectY[1] = chartBounds.top + qdp.height() - 12;
            }
          });
        } 
      },
  ],
  columnDescriptions = [
    { head: 'Study', cl: 'center description', colspan: 2},
    { head: 'Experimental', cl: 'center description', colspan: 3},
    { head: 'Control', cl: 'center description', colspan: 3},
    { head: 'Effect Size Estimates', cl: 'center description estimates', colspan: 5}
  ];

  function chart(selection) {
    this.selection = selection
    var that = this;
    selection.each(function(data, i) {
      init(data, that);
    })
  }

  function init(data, that) {
    div = that.selection;

    // create line for zero effect
    noEffectLine = div.append('svg')
      .attr('class','overlay')
      .append('line')
        .attr('class','no-effect-line')
        .style("stroke-dasharray", ("10, 2"));

    // if there is no selection, create a table
    if(div.select('table').empty()) {
      table = div.append('table');
    } else {
      table = div.select('table');
    }

    // set up quantile dotplot component
    qdp = quantileDotplot();

    chart.render(data);
  }

  chart.render = function(data) {
    // use the updated margins with the current parent width
    updateDimensions(div.node().parentNode.getBoundingClientRect().width)
    // set div dimensions
    div.style('width', width + margin.right + margin.left + 'px')
      .style('height', height + margin.top + margin.bottom + 'px')

    // fill in data from information provided
    data = calculateEstimatesPerStudy(data);

    // determine number of rows to expect in table
    nRows = data.length - 1; // zero-based indexing

    // append column descriptions
    table.append('thead').append('tr').selectAll('th').data(columnDescriptions)
      .enter().append('th')
        .attr('class', function(d) { return d.cl; })
        .attr('colspan', function(d) {return d.colspan;})
        .text(function(d) { return d.head; });

    // bind columns to table header
    var header = table.append('thead').append('tr').selectAll('th').data(columns);
    // enter set    
    header.enter()
      .append('th')
      .attr('class', function(col) { return col.cl; })
      .text(function(col) { return col.head; });
    // update set    
    header.attr('class', function(col) { return col.cl; })
      .text(function(col) { return col.head; });
    // exit set
    header.exit().remove();

    // bind data to table body
    var body = table.append('tbody').selectAll('tr').data(data);
    // create new rows
    rows = body.enter()
      .append('tr')
      .attr('id',function(row, i) { return 'r' + i; });
    // update assignment of data to cells in each row
    rows.selectAll('td')
      .data(function(row, i) {
          // console.log('row',row);
          return columns.map(function(c) {
              // compute cell values for this specific row
              var cell = {};
              d3.keys(c).forEach(function(k) {
                  cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
              });
              // console.log('col',c);
              // console.log('cell',cell);
              return cell;
          });
      }).enter() //enter table data
        .append('td')
        .html(function(col) { return col.html; })
        .attr('class', function(col) { return col.cl; });
    // exit set for table data
    rows.exit().remove();
    // delete extra rows
    body.exit().remove();

    // position line of no effect
    $(function() {
      var divBounds = div.node().getBoundingClientRect();
      noEffectLine.attr('x1', noEffectX)
        .attr('y1', noEffectY[0] + divBounds.top - 5)
        .attr('x2', noEffectX)
        .attr('y2', noEffectY[1] + divBounds.top);
    });
  }

  // fill in estimates of mean and sd of effect size estimate per study
  function calculateEstimatesPerStudy(data) {
    dataExtent = [-1, 1];
    for (i in data) {
      // fill in mean, sd, and n for differences
      data[i].nDiff = data[i].nExp + data[i].nCtrl;
      data[i].meanDiff = data[i].meanExp - data[i].meanCtrl;
      data[i].sdDiff = Math.sqrt(
        ((data[i].nExp - 1 ) * Math.pow(data[i].sdExp, 2) + (data[i].nCtrl - 1 ) * Math.pow(data[i].sdCtrl, 2)) 
        / (data[i].nDiff - 2)
      );
      // determine data extent
      var dataMin = Math.floor(data[i].meanDiff - 1.96 * data[i].sdDiff),
        dataMax = Math.ceil(data[i].meanDiff + 1.96 * data[i].sdDiff);
      if (dataMin < dataExtent[0]) {
        dataExtent[0] = dataMin;
      }
      if (dataMax > dataExtent[1]) {
        dataExtent[1] = dataMax;
      }
    }
    return data;
  }

  // calculate 95% CI
  function confint(d) {
    var stdErr = d.sdDiff / Math.sqrt(d.nDiff);
    return [
      Math.round((d.meanDiff - 1.96 * stdErr) * 100) / 100, 
      Math.round((d.meanDiff + 1.96 * stdErr) * 100) / 100
    ];
  }

  // set width and height state based on current window
  function updateDimensions(winWidth) {
    width = winWidth - margin.left - margin.right;
    height = width * 0.625;
  }

  // getter and setter functions
  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.init = function(_) {
    if (!arguments.length) return init;
    init = _;
    return chart;
  };

  return chart;
}