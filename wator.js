$(document).ready(function () {
    App.Start();
});

var App = {
  	INTERVAL : 20,
  	CANVAS_WIDTH : 1000,
  	CANVAS_HEIGHT : 1000,
  	CANVAS_ID : "canvas",
    CELL : 50,
  	XSTEP : 22,
  	YSTEP : 12,
    TOL : 40,
    TIMESTEP : 500,
  	NSHARK : 5,
  	NFISH : 100,
    MAXFISH : 200,
    MAXSHARK : 25,
    SHARKSTARVE : 20,
    SHARKSPAWN : 30,
    FISHSPAWN : 10
};

App.Start = function(){
	canvas = document.getElementById(this.CANVAS_ID);
    ctx = canvas.getContext('2d');

  	App.Init();

	Pos = App.GetRandPos();
 
	sharks = [];
	for(var i = 0; i < this.NSHARK; i++) {
		sharks.push(new Shark(Math.random(),Pos[i]));
	}
	fishes = [];
	for(var i = this.NSHARK; i < this.NSHARK + this.NFISH; i++) {
		fishes.push(new Fish(Math.random(),Pos[i]));
	}

	lastUpdate = Date.now();
	setTimeout("App.Run()", this.INTERVAL);
};

App.Init = function(){
  	ctx.canvas.width = this.CANVAS_WIDTH;
  	ctx.canvas.height = this.CANVAS_HEIGHT;

	ctx.setTransform(1, 0, 0, 1, 0, 0);
};

App.Run = function(){

	ctx.fillStyle = "#b4cef7";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(var i = 0; i < fishes.length; i++){
		fishes[i].Draw(ctx);
	}
	for(var i = 0; i < sharks.length; i++){
		sharks[i].Draw(ctx);
	}
	var now = Date.now();
	if (now - lastUpdate > App.TIMESTEP) {
		App.FishSwim(fishes,sharks);
	  	App.SharkSwim(fishes,sharks);
    	//updatePlot(fishes.length,sharks.length);
    	//console.log(fishes.length,sharks.length)
		lastUpdate = now;
	}

 	setTimeout("App.Run()", this.INTERVAL);
};

App.FishSwim = function(f,s){
  //console.log(f[0].direction);
	for(var i = 0; i < f.length; i++){
		var direction = f[i].direction;
		var moveX = direction.x * 150 + (Math.round(Math.random())*2-1)*this.CELL;
		var moveY = direction.y * 150 + (Math.round(Math.random())*2-1)*this.CELL;

	    //f[i].UpdatePosition(moveX, moveY);
	    var move = f[i].nextPosition(f,s);

	    move.scale(100);
	    //console.log(move);
	    //move.x *= Math.round(Math.random())*2-1;
	    //move.y *= Math.round(Math.random())*2-1;

	    if(f[i].spawn <= 0 && f.length < App.MAXFISH){
		    f.push(new Fish(Math.random(),f[i].position));
		    f[i].spawn = App.FISHSPAWN;
	    }
	    else {
	      	f[i].spawn -= 1;
	    }
	    //f[i].UpdatePosition(moveX, moveY);
		f[i].UpdatePosition(move.x, move.y);
	}
};

App.SharkSwim = function(f,s){
  for(var i = 0; i < s.length; i++){
    if(s[i].starving <= 0){
      s.splice(i, 1);
    }
  }
  for(var i = 0; i < s.length; i++){
    var eatFish = null;
    for(var j = 0; j < f.length; j++){
      var dist = s[i].DistanceTo(f[j]);
      if(dist < App.TOL){
        eatFish = f[j];
        break;
      }
    }
    if(eatFish == null){
		  var direction = s[i].direction;
  		var moveX = direction.x * 150 + (Math.round(Math.random())*2-1)*this.CELL;
  		var moveY = direction.y * 150 + (Math.round(Math.random())*2-1)*this.CELL;
      s[i].starving -= 1;
    }
    else {
      var dirX = eatFish.position.x - s[i].position.x;
      var dirY = eatFish.position.y - s[i].position.y;
      // when shark sees fish on other side
      if(Math.abs(dirX) > App.TOL){
        var moveX = dirX - Math.sign(dirX)*App.CANVAS_WIDTH;
      } else {
        var moveX = eatFish.position.x - s[i].position.x;
      }
      if(Math.abs(dirY) > App.TOL){
        var moveY = dirY - Math.sign(dirY)*App.CANVAS_HEIGHT;
      } else {
        var moveY = eatFish.position.y - s[i].position.y;
      }
      s[i].starving = App.SHARKSTARVE;
      f.splice(j, 1);
    }
    if(s[i].spawn <= 0 && s.length < App.MAXSHARK){
      s.push(new Shark(Math.random(),s[i].position));
      s[i].spawn = App.SHARKSPAWN;
    }
    else {
      s[i].spawn -= 1;
    }
    s[i].UpdatePosition(moveX*0.5,moveY*0.5)
  }
}

// utility stuff
App.GetRandPos = function(){
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

// fixing canvas size on some aspect ratios
$(document).ready(function () {
    fixCss();
});
$(window).resize(function() {
    fixCss();
});

function fixCss() {
    var margin_adjust = $("#margin_adjust");
    var max_width = $(window).height() - 22;
    var diff = margin_adjust.width() - max_width;
    console.log(diff);
    if (diff > 0) {
        $("#margin_adjust").css("padding-left", diff / 2 + "px");
        $("#margin_adjust").css("padding-right", diff / 2 + "px");
    }
    else {
        $("#margin_adjust").css("padding-left", 0 + "px");
        $("#margin_adjust").css("padding-right", 0 + "px");
    }
}