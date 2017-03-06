$(document).ready(function () {
    App.Start();
});

var App = {
	INTERVAL : 20,
	CANVAS_WIDTH : 1100,
	CANVAS_HEIGHT : 600,
	CANVAS_ID : "canvas",
  	CELL : 50,
	XSTEP : 22,
	YSTEP : 12,
	NSHARK : 5,
	NFISH : 40
};

App.Start = function(){
	canvas = document.getElementById(this.CANVAS_ID);
    	ctx = canvas.getContext('2d');

  	App.Init();

	Pos = App.getRandPos();

	sharks = [];
	for(var i = 0; i < this.NSHARK; i++){
		sharks.push(new Shark(Math.random(),Pos[i]));
	}
	fishes = [];
	for(var i = this.NSHARK; i < this.NSHARK + this.NFISH; i++){
		fishes.push(new Fish(Math.random(),Pos[i]));
	}

	lastUpdate = Date.now();

	setTimeout("App.Run()", this.INTERVAL);
};

App.Init = function(){
	ctx.canvas.width = this.CANVAS_WIDTH;
	ctx.canvas.height = this.CANVAS_HEIGHT;

	ctx.setTransform(1, 0, 0, 1, 0, 0);
//	ctx.scale(1, -1);
/*
	canvas.addEventListener('mousemove', function(e) {
		var rect = canvas.getBoundingClientRect();
    	var x = event.clientX - rect.left;
    	var y = event.clientY - rect.top;
		App.MouseClick(x, y);
	});
  */
};

App.MouseClick = function(x, y) {
	var now = Date.now();
	if (now - lastUpdate > 200) {
		fish.UpdatePosition(x, y);
  	fish2.UpdatePosition(x+1, y+1);
		lastUpdate = now;
	}
};

App.Run = function(){

	ctx.fillStyle = "#b4cef7";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(var i = 0; i < this.NFISH; i++){
		fishes[i].Draw(ctx);
	}
	for(var i = 0; i < this.NSHARK; i++){
		sharks[i].Draw(ctx);
	}
	var now = Date.now();
	if (now - lastUpdate > 300) {
		App.fishSwim(fishes,sharks);
		lastUpdate = now;
	}

 	setTimeout("App.Run()", this.INTERVAL);
};


App.fishSwim = function(f,s){
	for(var i = 0; i < f.length; i++){
		var moveX = (Math.round(Math.random())*2-1)*this.CELL;
		var moveY = (Math.round(Math.random())*2-1)*this.CELL;
		f[i].UpdatePosition(f[i].position.x+moveX,f[i].position.y+moveY)
	}
}
// utility stuff
App.getRandPos = function(){
	r = [];
	while(r.length < this.NSHARK+this.NFISH){
		var trig = false;
		var x = Math.ceil(Math.random()*(this.XSTEP-1));
		var y = Math.ceil(Math.random()*(this.YSTEP-1));
		pos = new Vec2(this.CELL*x, this.CELL*y); // cells have 40px width/height
		for(var i = 0; i < r.length; i++){
			if(r[i].x == pos.x && r[i].y == pos.y) trig = true;
		}
		if(trig) continue;
		r[r.length] = pos;
	}
	return r;
}
