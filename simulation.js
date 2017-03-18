
// abstract simulation mode class
SimulationMode = function(width, height) {
	this.WIDTH  = width;
  	this.HEIGHT = height;
};

SimulationMode.prototype.Run = function(ctx) {
	this.Update();
	this.DrawEnvironment(ctx);
	this.DrawEntities(ctx);
};

SimulationMode.prototype.Init = function() {};
SimulationMode.prototype.Update = function() {};
SimulationMode.prototype.DrawEnvironment = function(ctx) {};
SimulationMode.prototype.DrawEntities = function(ctx) {};

// child classes of SimulationMode
ClassicWator = function(width, height) {
	SimulationMode.apply(this, arguments);

	
};
ClassicWator.prototype = Object.create(SimulationMode.prototype);
ClassicWator.prototype.constructor = ClassicWator;


ContinuousWator = function(width, height) {
	SimulationMode.apply(this, arguments);

	this.CELL  = 50;
  	this.XSTEP  = this.WIDTH / this.CELL;
  	this.YSTEP  = this.HEIGHT / this.CELL;
    this.TOL  = 40;
    this.TIMESTEP  = 500;
  	this.NSHARK  = 5;
  	this.NFISH  = 100;
    this.MAXFISH  = 200;
    this.MAXSHARK  = 25;
    this.SHARKSTARVE  = 20;
    this.SHARKSPAWN  = 30;
    this.FISHSPAWN  = 1;

    this.BACKGROUND_COLOR = "#b4cef7";

    this.sharks = [];
    this.fishes = [];

    this.lastUpdate = Date.now();

    this.Init();
};

ContinuousWator.prototype = Object.create(SimulationMode.prototype);
ContinuousWator.prototype.constructor = ContinuousWator;

ContinuousWator.prototype.Init = function() {
	pos = this.GetRandPos();
 
	for(var i = 0; i < this.NSHARK; i++) {
		this.sharks.push(new Shark(Math.random(),pos[i]));
	}

	for(var i = this.NSHARK; i < this.NSHARK + this.NFISH; i++) {
		this.fishes.push(new Fish(Math.random(),pos[i]));
	}
};

ContinuousWator.prototype.Update = function() {

}

ContinuousWator.prototype.DrawEnvironment = function(ctx) {
	ctx.fillStyle = this.BACKGROUND_COLOR;
	ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
};

ContinuousWator.prototype.DrawEntities = function(ctx) {
	for(var i = 0; i < this.fishes.length; i++){
		this.fishes[i].Draw(ctx);
	}
	for(var i = 0; i < this.sharks.length; i++){
		this.sharks[i].Draw(ctx);
	}
	var now = Date.now();
	if (now - this.lastUpdate > this.TIMESTEP) {
		this.FishSwim(this.fishes,this.sharks);
	  	this.SharkSwim(this.fishes,this.sharks);
    	//updatePlot(this.fishes.length,this.sharks.length);
    	//console.log(this.fishes.length,this.sharks.length)
		this.lastUpdate = now;
	}
};

ContinuousWator.prototype.FishSwim = function(f,s){
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

	    if(f[i].spawn <= 0 && f.length < this.MAXFISH){
		    f.push(new Fish(Math.random(),f[i].position));
		    f[i].spawn = this.FISHSPAWN;
	    }
	    else {
	      	f[i].spawn -= 1;
	    }
	    //f[i].UpdatePosition(moveX, moveY);
		f[i].UpdatePosition(move.x, move.y);
	}
};

ContinuousWator.prototype.SharkSwim = function(f,s){
	for(var i = 0; i < s.length; i++){
		if(s[i].starving <= 0){
		  	s.splice(i, 1);
		}
	}
	for(var i = 0; i < s.length; i++){
		var eatFish = null;
		for(var j = 0; j < f.length; j++){
		  	var dist = s[i].DistanceTo(f[j]);
		  	if(dist < this.TOL){
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
			if(Math.abs(dirX) > this.TOL){
				var moveX = dirX - Math.sign(dirX)*this.CANVAS_WIDTH;
			} else {
				var moveX = eatFish.position.x - s[i].position.x;
			}
			if(Math.abs(dirY) > this.TOL){
				var moveY = dirY - Math.sign(dirY)*this.CANVAS_HEIGHT;
			} else {
				var moveY = eatFish.position.y - s[i].position.y;
			}
			s[i].starving = this.SHARKSTARVE;
			f.splice(j, 1);
		}
		if(s[i].spawn <= 0 && s.length < this.MAXSHARK){
		  	s.push(new Shark(Math.random(),s[i].position));
		  	s[i].spawn = this.SHARKSPAWN;
		}
		else {
		  	s[i].spawn -= 1;
		}
		s[i].UpdatePosition(moveX*0.5,moveY*0.5)
	}
};

ContinuousWator.prototype.GetRandPos = function(){
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
};






// behaviour class
// provides abstract interface for rule based classic wator behaviour or swarm behaviour
Behaviour = function () {

}


SwarmBehaviour = function() {
	SimulationMode.apply(this, arguments);

	
}
SwarmBehaviour.prototype = Object.create(SimulationMode.prototype);
SwarmBehaviour.prototype.constructor = Behaviour;