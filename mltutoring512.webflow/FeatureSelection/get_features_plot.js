function plotFeatures(featuresData, feature1, feature2) {

    var data = [];
    for (var i = 0; i < featuresData['labels'].length; i++) {
        data.push({
            feature1: featuresData['feature1'][i],
            feature2: featuresData['feature2'][i],
            label: featuresData['labels'][i]
        });
    }


    var margin = {top: 20, right: 15, bottom: 60, left: 60}
      , width = 800 - margin.left - margin.right
      , height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
              .domain([ d3.min(data, function(d) { return d['feature2']; }) - 2,
                        d3.max(data, function(d) { return d['feature2']; }) + 2])
              .range([ 0, width ]);

    var y = d3.scale.linear()
    	      .domain([ d3.min(data, function(d) { return d['feature1']; }) - 2,
                        d3.max(data, function(d) { return d['feature1']; }) + 2])
    	      .range([ height, 0 ]);

    // Remove existing charts
    d3.select("svg").remove();

    var chart = d3.select('#plot')
	.append('svg:svg')
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart')

    var main = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main')

    main.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 3))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Mean Pixel Values of Differenced Images");

    // draw the x axis
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient('bottom')

    main.append('g')
	.attr('transform', 'translate(0,' + height + ')')
	.attr('class', 'main axis date')
	.call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Mean " + feature2 + " pixel value")
      .style("font-size","14px");

    // draw the y axis
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient('left');

    main.append('g')
	.attr('transform', 'translate(0,0)')
	.attr('class', 'main axis date')
	.call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Mean " + feature1 + " pixel value")
      .style("font-size","14px");

    var g = main.append("svg:g");

    var color = ["steelblue", "red"]

    g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) { return x(d['feature2']); } )
          .attr("cy", function (d) { return y(d['feature1']); } )
          .attr("r", 5)
          .style("fill", function (d, i) { return color[d['label']]; } );

    var legend = g.selectAll(".legend")
        .data(color)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d, i) { return d; });

    var legendText = ["Non-deforestation", "Desforestation"]
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d, i) { return legendText[i]; })
        .style("font-size","12px");

}
