$(document).ready(function () {
    App.Start();
});

var App = {
	INTERVAL : 20, 
	CANVAS_WIDTH : 1000, 
	CANVAS_HEIGHT : 700,
	CANVAS_ID : "canvas"
};

App.Start = function(){
	canvas = document.getElementById(this.CANVAS_ID);
    ctx = canvas.getContext('2d');
	
    App.Init();

    fish = new Fish(Math.random());

	setTimeout("App.Run()", this.INTERVAL);
};

App.Init = function(){
	ctx.canvas.width = this.CANVAS_WIDTH;
	ctx.canvas.height = this.CANVAS_HEIGHT;

	ctx.setTransform(1, 0, 0, 1, 0, 0);
//	ctx.scale(1, -1);
	canvas.addEventListener('click', function(e) {
		var rect = canvas.getBoundingClientRect();
    	var x = event.clientX - rect.left;
    	var y = event.clientY - rect.top;
		App.MouseClick(x, y);
	});
};

App.MouseClick = function(x, y) {
	fish.UpdatePosition(x, y);
};

App.Run = function(){

	ctx.fillStyle = "#b4cef7";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	fish.Draw(ctx);
	setTimeout("App.Run()", this.INTERVAL);
};




