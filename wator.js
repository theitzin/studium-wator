$(document).ready(function () {
    App.Start();
});

var App = {
  	INTERVAL : 20,
  	CANVAS_WIDTH : 1000,
  	CANVAS_HEIGHT : 1000,
  	CANVAS_ID : "canvas",
};

App.Start = function() {
	canvas = document.getElementById(this.CANVAS_ID);
    this.ctx = canvas.getContext('2d');

  	App.Init();
    App.InitEvents();
	setTimeout("App.Run()", this.INTERVAL);
};

App.Init = function() {
  	this.ctx.canvas.width = this.CANVAS_WIDTH;
  	this.ctx.canvas.height = this.CANVAS_HEIGHT;
	this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    Entity.prototype.CANVAS_WIDTH = this.CANVAS_WIDTH;
    Entity.prototype.CANVAS_HEIGHT = this.CANVAS_HEIGHT;
    this.SimulationMode = new ClassicWator(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    this.PopulationPlot = new Plot("graph");
};

App.InitEvents = function() {
    $("#reset_button").click(function() {
        var value = $("input[name=simulationMode]:checked").val();

        if (value == 1) { // continuous case
            App.SimulationMode = new ContinuousWator(App.CANVAS_WIDTH, App.CANVAS_HEIGHT);
        }
        else if (value == 2) { // classic case 
            App.SimulationMode = new ClassicWator(App.CANVAS_WIDTH, App.CANVAS_HEIGHT);
        }
    });
};

App.Run = function() {
	this.SimulationMode.Run(this.ctx);

    var [nfish, nshark] = this.SimulationMode.GetPopulationData();
    this.PopulationPlot.Update(nfish, nshark, this.INTERVAL / 1000);
    fixCss();
 	setTimeout("App.Run()", this.INTERVAL);
};

function fixCss() {
    var margin_adjust = $("#margin_adjust");
    var max_width = $(window).height() - 36;
    var diff = margin_adjust.outerWidth() - max_width;
    if (diff > 0) {
        $("#margin_adjust").css("padding-left", diff / 2 + "px");
        $("#margin_adjust").css("padding-right", diff / 2 + "px");
    }
    else {
        $("#margin_adjust").css("padding-left", 0 + "px");
        $("#margin_adjust").css("padding-right", 0 + "px");
    }
}

$(document).ready(function () {
    fixPlotWidth();
});
$(window).resize(function() {
    fixPlotWidth();
});

function fixPlotWidth() {
    App.PopulationPlot.Relayout();
};
