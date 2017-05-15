var url="http://interactive-ml-guide.herokuapp.com/get_features/"
var url_train="http://interactive-ml-guide.herokuapp.com/train_svm/"
var feature1 = "red"
var feature2 = "blue"
var view = "plot"
var TrainLabels = [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]
var TestLabels = [0,1,0,1,0,1,0,1,0,1]

function getFeatures(callback) {
    var data = {
        x1: feature1,
        x2: feature2
    }
    $.ajax({
      type: "POST",
      url: url,
      data: data,
      success: function (results) {
          callback(results)
      }
    });
}

function setFeature1(newFeature1) {
    $(newFeature1).addClass('active').siblings().removeClass('active');
    feature1 = newFeature1.value;
    getFeatures(renderFeaturesPlotAndTable);
}

function setFeature2(newFeature2) {
    $(newFeature2).addClass('active').siblings().removeClass('active');
    feature2 = newFeature2.value;
    getFeatures(renderFeaturesPlotAndTable);
}

function renderFeaturesPlotAndTable(data) {
    var featuresData = {
        feature1: data['x1_array'],
        feature2: data['x2_array'],
        labels: TrainLabels
    }
    plotFeatures(featuresData, feature1, feature2);
    makeFeaturesTable(featuresData, feature1, feature2)
}

function makeFeaturesTable(featuresData, feature1, feature2) {
    var tableHTML = '<tr><th>Image Number</th><th>' + feature1
                    + ' mean</th><th>' + feature2 + ' mean</th><th>'
                    + 'Label</th></tr>';

    for (var i = 0; i < featuresData['labels'].length; i++) {
        tableHTML += '<tr><td>' + (i+1) + '</td><td>' + featuresData['feature1'][i] + '</td><td>' + featuresData['feature2'][i] + '</td> + <td>' + featuresData['labels'][i] + '</td></tr>'
    }

    $('#table').html(tableHTML);
}

function setView(newView) {
    $(newView).addClass('active').siblings().removeClass('active');
    view = newView.value;
    if (view == "plot") {
        $('#table-container').hide()
        $('#plot').show()
    } else {
        $('#table-container').show()
        $('#plot').hide()
    }
}

function trainModel(x_arrays){
  var x1_array = x_arrays['x1_array']
  var x2_array = x_arrays['x2_array']
  var data_train = {
      x1_array: x1_array,
      x2_array: x2_array,
      y_train: TrainLabels,
  }
  $.ajax({
    type: "POST",
    url: url_train,
    data: data_train,
    success: function (results) {
        renderFeaturesPlotAndDecisionBoundaryTrain(results, x_arrays);
    }
  });
}

function renderFeaturesPlotAndDecisionBoundaryTrain(classifierData, featuresData) {
    var featuresData = {
        feature1: featuresData['x1_array'],
        feature2: featuresData['x2_array'],
        labels: TrainLabels
    }
    var decisionBoundary = {
        slope: classifierData['m'],
        intercept: classifierData['b']
    }
    var plotElement = "#train-plot"
    plotFeaturesAndDecisionBoundary(featuresData, feature1, feature2,
        decisionBoundary, plotElement);
}

function testModel(x_arrays){
  var x1_array = x_arrays['x1_array']
  var x2_array = x_arrays['x2_array']
  var data_train = {
      x1_array: x1_array,
      x2_array: x2_array,
      y_train: TrainLabels,
  }
  $.ajax({
    type: "POST",
    url: url_train,
    data: data_train,
    success: function (results) {
        renderFeaturesPlotAndDecisionBoundaryTest(results, x_arrays);
        showClassifiedImages(results)
    }
  });
}

function renderFeaturesPlotAndDecisionBoundaryTest(classifierData, featuresData) {
    var featuresData = {
        feature1: featuresData['x1_array'].slice(15),
        feature2: featuresData['x2_array'].slice(15),
        labels: TestLabels
    }
    var decisionBoundary = {
        slope: classifierData['m'],
        intercept: classifierData['b']
    }
    var plotElement = "#test-plot"
    plotFeaturesAndDecisionBoundary(featuresData, feature1, feature2,
        decisionBoundary, plotElement);
}

function showClassifiedImages(results) {
    var offset = 15
    for (var i = 0; i < results['test_labels'].length; i++) {
        var imageNumber = offset + i;
        var beforeImageSrc = "../data/before/" + imageNumber + ".jpg"
        var afterImageSrc = "../data/after/" + imageNumber + ".jpg"
        var pred = results['test_labels'][i]
        if (pred == 0) {
            $("#deforestation-images").append(
                '<div class="image-pair">' +
                "<img src=" + beforeImageSrc + ">" +
                "<img src=" + afterImageSrc + ">" +
                '<div><br>'
            );
        } else {
            $("#non-deforestation-images").append(
                '<div class="image-pair">' +
                "<img src=" + beforeImageSrc + ">" +
                "<img src=" + afterImageSrc + ">" +
                '<div><br>'
            );
        }
    }
}


getFeatures(renderFeaturesPlotAndTable);
$('#table-container').hide()

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
	.orient('bottom');

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

function plotFeaturesAndDecisionBoundary(featuresData, feature1, feature2,
    decisionBoundary, plotElement) {

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
    d3.select(plotElement).html("");

    var chart = d3.select(plotElement)
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
        .text("SVM Model Decision Boundary");

    // draw the x axis
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient('bottom');

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

    var min_x = d3.min(data, function(d) { return d['feature2']; }) - 2
    var max_x = d3.max(data, function(d) { return d['feature2']; }) + 2
    var points = [[min_x, min_x*decisionBoundary['slope'] - decisionBoundary['intercept']],
                  [max_x, max_x*decisionBoundary['slope'] - decisionBoundary['intercept']]]
    var line = d3.svg.line()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return y(d[1]); });

    main.append("path")
      .data([points])
      .attr("class", "line")
      .attr("d", line);

}
