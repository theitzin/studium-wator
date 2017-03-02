$(document).ready(function () {
    App.Start();
});

var App = {
	INTERVAL : 20, 
	CANVAS_WIDTH : 800, 
	CANVAS_HEIGHT : 500,
	CANVAS_ID : "canvas"
};

App.Start = function(){
	canvas = document.getElementById(this.CANVAS_ID);
    ctx = canvas.getContext('2d');
	
    App.Init();

	setTimeout("App.Run()", this.INTERVAL);
};

App.Init = function(){
	ctx.canvas.width = this.CANVAS_WIDTH;
	ctx.canvas.height = this.CANVAS_HEIGHT;

	ctx.setTransform(1, 0, 0, 1, 0, 0);
//	ctx.scale(1, -1);
};

App.Run = function(){

	var fish = new Fish();
	fish.Draw(ctx);
};




