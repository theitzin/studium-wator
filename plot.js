// pretty plots
Plot = function(id) {
  this.div = $("#" + id)[0];
  this.time = 0;
  this.maxTimeInterval = 50;
  this.Create();
};

Plot.prototype.Create = function() {
  var trace1 = {
    x: [0],
    y: [0],
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'rgb(49, 154, 156)',
      width: 3
    },
    name: 'Fishes'
  };

  var trace2 = {
    x: [0],
    y: [0],
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'rgb(150, 157, 157)',
      width: 3
    },
    name: 'Sharks'
  };

  var data = [trace1, trace2];

  var layout = {
    title: 'Fish/Shark Growth',
    autosize: true,
    //width: 400,
    height: 400,
    xaxis: {
      title: 'Time',
      showgrid: false,
      zeroline: false,
      range: [0, 50]
    },
    yaxis: {
      title: 'Percent',
      showline: false,
      range: [0, 1]
    }
  };

  Plotly.newPlot(this.div, data, layout);
};

Plot.prototype.Update = function(fishValue, sharkValue, dt) {
  this.time += dt;
  var data = this.div.data;
  data[0].x.push(this.time);
  data[1].x.push(this.time);
  data[0].y.push(fishValue);
  data[1].y.push(sharkValue);

  if(this.time > this.maxTimeInterval) {
    var range = [this.time - this.maxTimeInterval, this.time];
    Plotly.relayout(this.div, {'xaxis.range': range});
  }
  var update = {
    x : [data[0].x, data[1].x],
    y : [data[0].y, data[1].y],
  }
  Plotly.restyle(this.div, update);
};

Plot.prototype.Relayout = function() {
  Plotly.relayout(this.div, {});
};
