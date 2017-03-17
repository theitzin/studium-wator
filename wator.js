$(document).ready(function () {
    App.Start();
});

var App = {
  	INTERVAL : 30,
  	CANVAS_WIDTH : 600,
  	CANVAS_HEIGHT : 400,
  	CANVAS_ID : "canvas",
    CELL : 50,
  	XSTEP : 22,
  	YSTEP : 12,
    TOL : 40,
    TIMESTEP : 500,
  	NSHARK : 5,
  	NFISH : 200,
    MAXFISH : 300,
    MAXSHARK : 40,
    SHARKSTARVE : 4,
    SHARKSPAWN : 10,
    FISHSPAWN : 10,
    FISHAGE : 100
};

App.Start = function(){
  canvas = document.getElementById(this.CANVAS_ID);
  ctx = canvas.getContext('2d');

  App.Init();

  Pos = App.GetRandPos();

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
    updatePlot(fishes.length/App.MAXFISH,sharks.length/App.MAXSHARK);
    //console.log(fishes.length,sharks.length)
		lastUpdate = now;
	}

 	setTimeout("App.Run()", this.INTERVAL);
};


App.FishSwim = function(f,s){
  for(var i = 0; i < f.length; i++){
    if(f[i].age <= 0){
      f.splice(i, 1);
    }
    else{
      f[i].age -= 1;
    }
  }
	for(var i = 0; i < f.length; i++){
    var move = f[i].nextPosition(f,s);
    /*
    if(move.length() < 200){
      move.scale(130);
    } else{
      cosole.log("hi")
      move.scale(200/move.length());
    }*/
    if(f.length < App.MAXFISH){
      if(f[i].spawn <= 0){
        f.push(new Fish(Math.random(),f[i].position));
        f[i].spawn = App.FISHSPAWN;
      }
      else {
        f[i].spawn -= 1;
      }
    }
    else{
      f[i].spawn += 1;
    }
		f[i].UpdatePosition(move.x, move.y);
	}
}

App.SharkSwim = function(f,s){
  for(var i = 0; i < s.length; i++){
    if(s[i].starving <= 0){
      s.splice(i, 1);
    }
  }
  for(var i = 0; i < s.length; i++){
    var direction = s[i].direction;
    var eatFish = null;
    var ind = 0;
    var goTo = null;
    var minDist = 150;
    for(var j = 0; j < f.length; j++){
      var dist = s[i].DistanceTo(f[j]);
      if(dist < minDist) {
        if(dist < App.TOL){
          eatFish = f[j];
          ind = j;
        }
        goTo = f[j].position;
      }
    }
    if(eatFish == null){
      /*
      var move = s[i].nextPosition(s,[]).scale(10);
      var moveX = move.x;
      var moveY = move.y;
      */
      if(goTo == null){
    		var moveX = direction.x * 150 + (Math.round(Math.random())*2-1)*this.CELL;
    		var moveY = direction.y * 150 + (Math.round(Math.random())*2-1)*this.CELL;
      } else {
        var moveX = goTo.x - s[i].position.x;
        var moveY = goTo.y - s[i].position.y;
      }
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
      f.splice(ind, 1);
    }
    if(s.length < App.MAXSHARK){
      if(s[i].spawn <= 0){

    		var X = s[i].position.x + direction.x * 150 + 2*(Math.round(Math.random())*2-1)*this.CELL;
    		var Y = s[i].position.y + direction.y * 150 + 2*(Math.round(Math.random())*2-1)*this.CELL;

        s.push(new Shark(Math.random(),new Vec2(X,Y)));
        s[i].spawn = App.SHARKSPAWN;
      }
      else {
        s[i].spawn -= 1;
      }
    } else {
      s[i].spawn += 1;
    }
    s[i].UpdatePosition(moveX,moveY)
  }
}

// utility stuff
App.GetRandPos = function(){
	r = [];
	while(r.length < this.NSHARK+this.NFISH){
		var trig = false;
		//var x = Math.ceil(Math.random()*(this.XSTEP-1));
		//var y = Math.ceil(Math.random()*(this.YSTEP-1));
		//pos = new Vec2(this.CELL*x, this.CELL*y); // cells have 40px width/height
		var x = Math.ceil(Math.random()*(this.CANVAS_WIDTH-1));
		var y = Math.ceil(Math.random()*(this.CANVAS_HEIGHT-1));
		pos = new Vec2(x, y); // cells have 40px width/height
		for(var i = 0; i < r.length; i++){
			if(r[i].x == pos.x && r[i].y == pos.y) trig = true;
		}
		if(trig) continue;
		r[r.length] = pos;
	}
	return r;
}
