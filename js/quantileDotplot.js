/*
 * REUSABLE CHART COMPONENTS
 * 
 */
function quantileDotplot() {

  var margin = { 'top': 2, 'right': 2, 'left': 2, 'bottom': 15 },
    width,
    height,
    svg,
    chartWrapper,
    data,
    partitionWidth = .5,
    nDots = 20,
    spacingFactor = 1.25,
    preferredAspectRatio = 0.15,
    dotRadius = 5,
    minDotRadius = 4,
    // maxDotRadius = 10,
    maxDots,
    xExtent,
    xBins,
    yExtent,
    x0,
    x,
    y,
    xAxis,
    yAxis,
    selection,
    hideAxes = true;

  function chart(selection) {
    this.selection = selection
    var that = this;
    selection.each(function(data, i) {
      init(data, that);
    })
  }

  function init(data, that) {
    // initialize our x, y scales, x and y axis and initial svg and wrapper for our chart
    svg = that.selection;

    // if there is no selection, create a wrapper for our chart
    if(svg.select('g').empty()) {
      chartWrapper = svg.append('g').attr('class','chart-wrapper');
      chartWrapper.append('g').attr('class', 'x axis');
      // chartWrapper.append('g').attr('class', 'y axis');
    } else {
      chartWrapper = svg.select('g')
    }

    chart.render(data);
  }

  chart.render = function(data) {
    // format the distribution parameters as points for a quantile dotplot
    data = formatDataFromParams(data);
    // start with by informing dimensions based on current parent width
    updateDimensionsFromParent();  
    // update scales
    setAxesScales(data);
    // adjust chart dimensions for good plotting
    // resetDimensionsPlot();

    // set svg and chartWrapper dimensions
    svg.attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      // .attr('transform', 'translate(' + 0 + ',' + 5 + ')'); // top padding for td is 5px
    chartWrapper.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // change tick values based on data
    if (!hideAxes) {
      // // prep y-axis
      // yTicksN = 6;
      // yTickVals = Array.apply(null, {length: yTicksN + 1}).map(function(val, idx){ return idx; }).map(function(elem) {
      //   return yExtent[1] * elem / yTicksN;
      // });
      // yAxis.scale(y)
      //   .ticks(yTicksN)
      //   .tickSize(4)
      //   .tickValues(yTickVals)
      //   .tickPadding(7);
      // // create and translate the y axis
      // svg.select('.y.axis')
      //   .attr('transform', 'translate(' + width + ', 0)')
      //   .call(yAxis);
      // prep x-axis
      xTicksN = 8;
      xTickVals = Array.apply(null, {length: xTicksN + 1}).map(function(val, idx){ return idx; }).map(function(elem) {
        return (xBins[xBins.length - 1] - xBins[0]) * elem / xTicksN + xBins[0];
      });
      xAxis.scale(x)
        .ticks(xTicksN)
        .tickSize(3)
        .tickValues(xTickVals)
        .tickPadding(5);
      // create and translate the x axis
      svg.select('.x.axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    }

    // now, update and edit the bar charts
    var dot = chartWrapper.selectAll('.g-dot')
      .data(data);

    // enter set
    dot.enter().append('circle')
      .attr('class', 'g-dot')
        .attr("cx", function(d) {
          return x0(d.bin);
        }) 
        .attr("cy", function(d) {         
          return y(0) - d.idx * 2 * dotRadius - dotRadius; 
        })
        .attr("r", 0)
        .transition()
          .duration(500)
          .attr("r", function(d) {
          return (d.length==0) ? 0 : dotRadius; });

    // update set
    dot.attr("cx", function(d) {
      return x0(d.bin);
    }) 
    .attr("cy", function(d) {
        return y(0) - d.idx * 2 * dotRadius - dotRadius; })
    .attr("r", 0)
    .transition()
      .duration(500)
      .attr("r", function(d) {
      return (d.length==0) ? 0 : dotRadius; });

    // exit set
    dot.exit()
      .transition()
        .duration(1000)
        .attr("r", 0)
        .remove();
  }

  // format data for quantile dotplots from distribution parameters
  function formatDataFromParams(data) {
    // determine x values in which to bin dots
    var distMin = Math.floor(jStat.normal.inv(0.025, data.meanDiff, data.sdDiff)),
      distMax = Math.ceil(jStat.normal.inv(0.975, data.meanDiff, data.sdDiff)),
      partitionMidpoints = [];
    for (var i = distMin; i <= distMax; i += partitionWidth) {
      partitionMidpoints.push(i - partitionWidth / 2);
    }
    // generate nDots points to display based on distribution parameters
    var plotData = [],
      lastBin = partitionMidpoints[0] - 1, // dummy value
      countInBin = 0;
      maxDots = 0;
    for (var i = 1.0 / nDots; i < 1; i += (1.0 / nDots)) {
      // get distribution value at this quantile and corresponding bin
      var rawValue = jStat.normal.inv(i, data.meanDiff, data.sdDiff),
        binMidpoint = partitionMidpoints.reduce(function(closest, curr) {
          // find and return the partition midpoint which is closest to the raw value
          // of the distribution at this quantile (this might not be the right way to bin points)
          if (Math.abs(closest - rawValue) > Math.abs(curr - rawValue)) {
            return curr;
          } else {
            return closest;
          }
        });
      // how many dots in this bin?
      if (binMidpoint === lastBin) {
        countInBin++;
      } else {
        countInBin = 0;
      }
      if (countInBin > maxDots) {
        maxDots = countInBin;
      }
      plotData.push({
        'quantile': i,
        'value': rawValue,
        'bin': binMidpoint,
        'idx': countInBin
      });
      lastBin = binMidpoint;
    }
    return plotData;
  }

  // set the current axes scales based on the current data
  function setAxesScales(data) {
    // xBins = data.map(function(d) { return d.bin; });
    // yExtent = [0, 1];    
    xBins = [];
    for (var i = xExtent[0] + partitionWidth / 2; i <= xExtent[1]; i += partitionWidth) {
      xBins.push(i);
    }
    yExtent = [0, maxDots/nDots];

    // d3.scalePoint instead of scaleBand()
    // x0 = d3.scalePoint()
    //   .domain(xBins)
    //   .padding(dotRadius/20);

    x0 = d3.scaleBand()
      .domain(xBins)
      .range([0, width])
      .paddingInner(spacingFactor - 1)
      .paddingOuter(1);
      
    x = d3.scaleLinear()
      .domain(xExtent)
      .range([0, width]);

    y = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0]);

    xAxis = d3.axisBottom()
      .scale(x);
    // yAxis = d3.axisRight()
    //   .scale(y);
  }
  
  // set width and height state based on range of dot radii which are best for plotting
  // function resetDimensionsPlot() {
  //   // smaller of half the height of one dot on current scale or maximum radius
  //   dotRadius = Math.min(Math.abs(y(yExtent[1] / maxDots) - y(0)) / 2, maxDotRadius); 
  //   // no larger than minimum dot radius
  //   dotRadius = Math.max(dotRadius, minDotRadius);
  //   // width should be set by size of dots and spacing?
  //   console.log('dotRadius', dotRadius);

  //   width = dotRadius * 2 * nDots * spacingFactor;
  //   // set height based on either preferred aspect ratio OR minimum dot radius
  //   // var aspectRatioHeight = width * preferredAspectRatio,
  //   //   minDotRadiusHeight = maxDots * minDotRadius * 2; 
  //   // height = Math.max(aspectRatioHeight, minDotRadiusHeight);
  //   height = maxDots * dotRadius * 2;
  //   // reset scale ranges based on updated dimensions
  //   x0.range([0, width]);
  //   x.range([0, width]);
  //   y.range([height, 0]);
  // }
  
  // set width and height state based on the dimensions of the parent element
  function updateDimensionsFromParent() {
    winWidth = svg.node().parentNode.getBoundingClientRect().width;
    // set width based on parent element of svg
    width = winWidth - margin.left - margin.right;
    // set height based on either preferred aspect ratio OR minimum dot radius
    var aspectRatioHeight = winWidth * preferredAspectRatio - margin.top - margin.bottom,
      minDotRadiusHeight = maxDots * minDotRadius * 2; 
    height = Math.max(aspectRatioHeight, minDotRadiusHeight);
    console.log('from parent',width, height);
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

  chart.partitionWidth = function(_) {
    if (!arguments.length) return partitionWidth;
    partitionWidth = _;
    return chart;
  };

  chart.nDots = function(_) {
    if (!arguments.length) return nDots;
    nDots = _;
    return chart;
  };

  chart.spacingFactor = function(_) {
    if (!arguments.length) return spacingFactor;
    spacingFactor = _;
    return chart;
  };
  
  chart.preferredAspectRatio = function(_) {
    if (!arguments.length) return preferredAspectRatio;
    preferredAspectRatio = _;
    return chart;
  };

  chart.dotRadius = function(_) {
    if (!arguments.length) return dotRadius;
    dotRadius = _;
    return chart;
  };

  chart.minDotRadius = function(_) {
    if (!arguments.length) return minDotRadius;
    minDotRadius = _;
    return chart;
  };

  chart.hideAxes = function(_) {
    if (!arguments.length) return hideAxes;
    hideAxes = _;
    return chart;
  };

  chart.xExtent = function(_) {
    if (!arguments.length) return xExtent;
    xExtent = _;
    return chart;
  };

  // get pixels at x==0
  chart.xZero = function() {
    return x(0);
  }

  chart.init = function(_) {
    if (!arguments.length) return init;
    init = _;
    return chart;
  };

  return chart;
}