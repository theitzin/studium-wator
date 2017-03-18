graphDiv = document.getElementById('graph');
var trace1 = {
  x: [0],
  y: [App.NFISH/App.MAXFISH],
  type: 'scatter',
  name: 'Fishes'
};
var trace2 = {
  x: [0],
  y: [App.NSHARK/App.MAXSHARK],
  type: 'scatter',
  name: 'Sharks'
};

var data = [trace1, trace2];
var layout = {
  title: 'Fish/Shark Growth',
  width: 400,
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
Plotly.newPlot(graphDiv, data, layout);


function updatePlot(f,s){
  PLOT = document.getElementById('graph');
  var data = PLOT.data;
  t = data[0].x[data[0].x.length-1];
  data[0].x.push(t+1);
  data[1].x.push(t+1);
  data[0].y.push(f);
  data[1].y.push(s);
  r = 50;
  if(t>r){
    var range = [t-r, t];
    Plotly.relayout(PLOT, {'xaxis.range': range});
  }
  var update = {
    x : [data[0].x, data[1].x],
    y : [data[0].y, data[1].y],
  }
  Plotly.restyle(PLOT, update);
}
