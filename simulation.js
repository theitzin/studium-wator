
// abstract simulation mode class
SimulationMode = function(width, height) {
	this.WIDTH  = width;
  	this.HEIGHT = height;
  	this.TIMESTEP  = 1000; // default
  	this.lastUpdate = Date.now();

  	this.behaviour;
};

SimulationMode.prototype.Run = function(ctx) {
	var now = Date.now();
	if (now - this.lastUpdate > this.TIMESTEP) {
		this.Update();
		this.lastUpdate = now;
	}
	this.DrawEnvironment(ctx);
	this.DrawEntities(ctx);
};

SimulationMode.prototype.Init = function() {};
SimulationMode.prototype.Update = function() {};
SimulationMode.prototype.DrawEnvironment = function(ctx) {};
SimulationMode.prototype.DrawEntities = function(ctx) {};

// child classes of SimulationMode
// classic Wator
//
ClassicWator = function(width, height) {
	SimulationMode.apply(this, arguments);

	this.CELL  = 50;
  	this.XSTEP  = this.WIDTH / this.CELL;
  	this.YSTEP  = this.HEIGHT / this.CELL;
  	this.INITIALSHARK  = 10;
  	this.INITIALFISH  = 100;

  	this.nShark = this.INITIALSHARK;
  	this.nFish = this.INITIALFISH;

  	this.BACKGROUND_COLOR = "#b4cef7";
  	this.TIMESTEP = 2000;

  	this.iteration = 0;
  	this.grid = [];
  	this.behaviour = new RuleBased(this.CELL);

  	this.Init();
};
ClassicWator.prototype = Object.create(SimulationMode.prototype);
ClassicWator.prototype.constructor = ClassicWator;

ClassicWator.prototype.Init = function() {
	this.grid = ZeroInit(this.XSTEP, this.YSTEP);

	for (var i = 0; i < this.INITIALFISH; i++) {
		var position = this.GetRandomPosition();
		if (this.grid[position.x][position.y] == 0) {
			canvasPosition = position.clone().scale(this.CELL).addXY(this.CELL / 2, this.CELL / 2);
			behaviourData = { "age" : 0, "iteration" : 0 };
			this.grid[position.x][position.y] = new Fish(Math.random(), canvasPosition, behaviourData);
		}
		else {
			i--;
		}
	}

	for (var i = 0; i < this.INITIALSHARK; i++) {
		var position = this.GetRandomPosition();
		if (this.grid[position.x][position.y] == 0) {
			canvasPosition = position.clone().scale(this.CELL).addXY(this.CELL / 2, this.CELL / 2);
			behaviourData = { "age" : 0, "fasten" : 0, "iteration" : 0 };
			this.grid[position.x][position.y] = new Shark(Math.random(), canvasPosition, behaviourData);
		}
		else {
			i--;
		}
	}
};

ClassicWator.prototype.Update = function() {
	this.iteration++;

	// move shark first to allow them to catch fish
	for (var i, j, it = new RandomIterator(this.XSTEP * this.YSTEP), k = it.Next(); !it.Empty(); k = it.Next()) {
		[i, j] = [k % this.XSTEP, Math.floor(k / this.XSTEP)];
		if (this.grid[i][j] instanceof Shark) {
			this.behaviour.NextPosition(i, j, this.grid, this.iteration);
		}
	}

	for (var i, j, it = new RandomIterator(this.XSTEP * this.YSTEP), k = it.Next(); !it.Empty(); k = it.Next()) {
		[i, j] = [k % this.XSTEP, Math.floor(k / this.XSTEP)];
		if (this.grid[i][j] instanceof Fish) {
			this.behaviour.NextPosition(i, j, this.grid, this.iteration);
		}
	}

	this.nFish = 0;
	this.nShark = 0;
	for (var i = 0; i < this.XSTEP; i++) {
		for (var j = 0; j < this.YSTEP; j++) {
			if (this.grid[i][j] instanceof Fish) {
				this.nFish++;
			}
			if (this.grid[i][j] instanceof Shark) {
				this.nShark++;
			}
		}
	}
};

ClassicWator.prototype.DrawEnvironment = function(ctx) {
	ctx.fillStyle = this.BACKGROUND_COLOR;
	ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

	for (var i = 1; i < this.XSTEP; i++) {
		this.DrawLine(ctx, new Vec2(i * this.CELL, 0), new Vec2(i * this.CELL, this.HEIGHT));
	}

	for (var i = 1; i < this.YSTEP; i++) {
		this.DrawLine(ctx, new Vec2(0, i * this.CELL), new Vec2(this.WIDTH, i * this.CELL));
	}
};

ClassicWator.prototype.DrawEntities = function(ctx) {
	for (var i = 0; i < this.XSTEP; i++) { 
		for (var j = 0; j < this.YSTEP; j++){
			if (this.grid[i][j] != 0) {
				this.grid[i][j].Draw(ctx);
			}
		}
	}
};

ClassicWator.prototype.GetRandomPosition = function() {
	var x = Math.floor(Math.random()*(this.XSTEP-1));
	var y = Math.floor(Math.random()*(this.YSTEP-1));

	return new Vec2(x, y);
};

ClassicWator.prototype.DrawLine = function(ctx, p1, p2) {
	ctx.strokeStyle="#808080";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
};

RandomIterator = function(n) {
	this.list = [];
	for (var i = 0; i < n; i++) {
		this.list.push(i);
	}
};
RandomIterator.prototype.Empty = function () { 
	return this.list.length == 0;
};
RandomIterator.prototype.Next = function () {
	if (this.list.length == 0) {
		return -1;
	}
	var index = Math.floor(Math.random() * this.list.length);
	var value = this.list[index];
	this.list.splice(index, 1);
	return value;
};

//
// continuous Wator
//
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
    this.behaviour = new SwarmBehaviour();

    this.Init();
};

ContinuousWator.prototype = Object.create(SimulationMode.prototype);
ContinuousWator.prototype.constructor = ContinuousWator;

ContinuousWator.prototype.Init = function() {
	pos = this.GetRandPos();
 
	for(var i = 0; i < this.NSHARK; i++) {
		behaviourData = { "spawn": 30, "starving": 20 };
		this.sharks.push(new Shark(Math.random(),pos[i], behaviourData));
	}

	for(var i = this.NSHARK; i < this.NSHARK + this.NFISH; i++) {
		behaviourData = { "spawn": this.FISHSPAWN*Math.round(Math.random()*10) };
		this.fishes.push(new Fish(Math.random(),pos[i], behaviourData));
	}
};

ContinuousWator.prototype.Update = function() {
	this.FishSwim(this.fishes,this.sharks);
	this.SharkSwim(this.fishes,this.sharks);
};

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
	    var move = this.behaviour.NextPosition(f[i], f,s);

	    move.scale(100);
	    //console.log(move);
	    //move.x *= Math.round(Math.random())*2-1;
	    //move.y *= Math.round(Math.random())*2-1;

	    if(f[i].behaviourData["spawn"] <= 0 && f.length < this.MAXFISH){
	    	behaviourData = { "spawn": this.FISHSPAWN*Math.round(Math.random()*10) };
		    f.push(new Fish(Math.random(),f[i].position, behaviourData));
		    f[i].behaviourData["spawn"] = this.FISHSPAWN;
	    }
	    else {
	      	f[i].behaviourData["spawn"] -= 1;
	    }
	    //f[i].UpdatePosition(moveX, moveY);
		f[i].UpdatePosition(move.x, move.y);
	}
};

ContinuousWator.prototype.SharkSwim = function(f,s){
	for(var i = 0; i < s.length; i++){
		if(s[i].behaviourData["starving"] <= 0){
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
			s[i].behaviourData["starving"] -= 1;
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
			s[i].behaviourData["starving"] = this.SHARKSTARVE;
			f.splice(j, 1);
		}
		if(s[i]["spawn"] <= 0 && s.length < this.MAXSHARK){
			behaviourData = { "spawn": 30, "starving": 20 };
		  	s.push(new Shark(Math.random(),s[i].position, behaviourData));
		  	s[i].behaviourData["spawn"] = this.SHARKSPAWN;
		}
		else {
		  	s[i].behaviourData["spawn"] -= 1;
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
Behaviour = function () {};
Behaviour.prototype.Init = function() {};
Behaviour.prototype.NextPosition = function() {};



RuleBased = function(cellSize) {
	Behaviour.apply(this, arguments);

	this.CELLSIZE = cellSize;
	this.FBRUT = 8;
	this.HBRUT = 10;
	this.FASTEN = 10;

	this.Init();
};
RuleBased.prototype = Object.create(Behaviour.prototype);
RuleBased.prototype.constructor = Behaviour;

RuleBased.prototype.Init = function() {

};

RuleBased.prototype.NextPosition = function(x, y, grid, iteration) {
	if (grid[x][y] == 0)
		return;

	var entity = grid[x][y];
	var delta = new Vec2(0, 0);
	if (entity instanceof Fish && entity.behaviourData["iteration"] < iteration) {
		entity.behaviourData["age"]++;
		entity.behaviourData["iteration"]++;

		var [directions, indices] = this.GetDirections(x, y, grid, e => e == 0);
		if (directions.length != 0) {
			var rand = Math.floor(Math.random() * directions.length);
			delta = directions[rand];
		}

		if (!delta.isZero()) {
			grid[indices[rand].x][indices[rand].y] = entity;
			grid[x][y] = 0;
		}

		if (!delta.isZero() && entity.behaviourData["age"] >= this.FBRUT) {
			entity.behaviourData["age"] = 0;
			var behaviourData = { "age" : 0, "iteration" : iteration };
			var canvasPosition = new Vec2(x, y).scale(this.CELLSIZE).addXY(this.CELLSIZE / 2, this.CELLSIZE / 2);
			grid[x][y] = new Fish(Math.random(), canvasPosition, behaviourData);
		}
	}

	if (entity instanceof Shark && entity.behaviourData["iteration"] < iteration) {
		entity.behaviourData["age"]++;
		entity.behaviourData["fasten"]++;
		entity.behaviourData["iteration"]++;

		var [directions, indices] = this.GetDirections(x, y, grid, e => e instanceof Fish);
		if (directions.length != 0) {
			entity.behaviourData["fasten"] = 0;
			var rand = Math.floor(Math.random() * directions.length);
			delta = directions[rand];
			grid[indices[rand].x][indices[rand].y] = 0; // fish eaten
		}
		else { 
			var [directions, indices] = this.GetDirections(x, y, grid, e => e == 0);
			if (directions.length != 0) {
				var rand = Math.floor(Math.random() * directions.length);
				delta = directions[rand];
			}
		}

		if (entity.behaviourData["fasten"] >= this.FASTEN) {
			grid[x][y] = 0; // shark dies
			return;
		}

		if (!delta.isZero()) {
			grid[indices[rand].x][indices[rand].y] = entity;
			grid[x][y] = 0;
		}

		if (!delta.isZero() && entity.behaviourData["age"] >= this.HBRUT) {
			entity.behaviourData["age"] = 0;
			var behaviourData = { "age" : 0, "fasten" : 0, "iteration" : iteration };
			var canvasPosition = new Vec2(x, y).scale(this.CELLSIZE).addXY(this.CELLSIZE / 2, this.CELLSIZE / 2);
			grid[x][y] = new Shark(Math.random(), canvasPosition, behaviourData);
		}
	}

	if (!delta.isZero()) {
		entity.UpdatePosition(delta.x, delta.y);
	}
};

RuleBased.prototype.GetDirections = function(x, y, grid, lambda) {
	var width = grid.length;
	var height = grid[0].length;

	var indices = [];
	var directions = [];
	if (lambda(grid[(x - 1).mod(width)][y])) {
		indices.push(new Vec2((x - 1).mod(width), y));
		directions.push(new Vec2(-this.CELLSIZE, 0));
	}
	if (lambda(grid[(x + 1).mod(width)][y])) {
		indices.push(new Vec2((x + 1).mod(width), y));
		directions.push(new Vec2(this.CELLSIZE, 0));
	}
	if (lambda(grid[x][(y - 1).mod(height)])) {
		indices.push(new Vec2(x, (y - 1).mod(height)));
		directions.push(new Vec2(0, -this.CELLSIZE));
	}
	if (lambda(grid[x][(y + 1).mod(height)])) {
		indices.push(new Vec2(x, (y + 1).mod(height)));
		directions.push(new Vec2(0, this.CELLSIZE));
	}

	return [directions, indices];
};


SwarmBehaviour = function() {
	Behaviour.apply(this, arguments);	
};
SwarmBehaviour.prototype = Object.create(Behaviour.prototype);
SwarmBehaviour.prototype.constructor = Behaviour;

SwarmBehaviour.prototype.NextPosition = function(entity, entityList,entityListFlee) {
	var h = 0.1;
	var vel = entity.velocity.clone();
	var pos = entity.position.clone();
	var f = this.fun(entity, entityList,entityListFlee);
	entity.velocity.setVec2(entity.velocity.clone().add(f.scale(h)));
	//console.log(entity.velocity);
	entity.direction.setVec2(entity.velocity.clone().normalize());
	vel.scale(h);
	return vel;
};

SwarmBehaviour.prototype.fun = function(entity, entityList,entityListFlee) {
	var alpha = 0.07;
	var beta = 0.05;
	var m = 1;
	var N = entityList.length;
	var vel = entity.velocity.clone();

	//console.log(vel);
	var s1 = vel.scale(alpha - beta*vel.length2());
	var s2 = new Vec2(0,0);
	//var Bi = entity.B(entityList);
	var Ri = this.R(entity, entityListFlee).scale(0.5);
	var Ri2 = this.R(entity, entityList).scale(0.1);
	Ri.add(Ri2);
	//var Ai = this.A(entity, entityList).scale(0.3);
	//var Si = this.S(entity, entityListFlee).scale(10);
	//console.log(s1,Bi,Ri,Ai);
	//s1 = s1.add(Ri.add(Ai)).scale(1/m);
	//Erweiterte Cucker-Smale-Modelle
		/*
	// Cucker-Smale Partikel-Modell
	for(var i = 0; i < N; i++){
		if(entity.position != entityList[i].position){
			var vel = entityList[i].direction.clone().sub(entity.direction);
			var pos = entityList[i].position.clone().sub(entity.position);
			var r = pos.length()
			s2 = s2.add(vel.scale(H(r)));
		}
	*/
	//Selbstantriebs, Abbremsungs, und Anziehungs–Abstoßungs-Partikel Modell
	for(var i = 0; i < N; i++){
		if(entity.position != entityList[i].position){
			s2 = s2.add(NablaU(entity.position,entityList[i].position));
		}
	}
	//console.log(s1,s2,Si);
	//return s2.scale(1/N);
	return s1.add(Ri.sub(s2));
};

function H(r){
	var k = 600;
	var sigma = 1000;
	var gamma = 1/20;

	return k/Math.pow(sigma+r*r,gamma);
};

SwarmBehaviour.prototype.S = function(entity, entityList){
	var beta1 = 1/100;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var rLen = r.length();
		var v = entityList[i].velocity.clone().sub(entity.velocity)
		s = s.add(v.scale(1/(Math.pow(1+rLen,beta1))));
	}
	return s.scale(1/N);
};

SwarmBehaviour.prototype.R = function(entity, entityList){
	var rho = 10;
	var beta1 = 1/5;
	var d = 200;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var rLen = r.length();
		s = s.add(r.scale(cutoff(rLen,1,d)/(Math.pow(1+rLen*rLen,beta1))));
	}
	return s.scale(rho/N);
};

SwarmBehaviour.prototype.B = function(entity, entityList){
	var d = 400;
	var N = entityList.length;
	var C = 10;

	var rho = 0;
	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var rLen = r.length2();
		rho = rho + 1/(1+rLen);
	}
	rho = rho/N;
	var l = entity.velocity.length();
	return entity.velocity.ortho().scale(l*C*(1-cutoff(rho,1,d)));
};

function cutoff(x,v,d){
	return (1-Math.tanh(v*(x-d)))/2;
};

SwarmBehaviour.prototype.A = function(entity, entityList){
	var d = 400;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var v = entityList[i].velocity.clone().sub(entity.velocity)
		var rLen = r.length();
		var w = wFun(r,entity.velocity.clone());
		s = s.add(v.scale((1-cutoff(rLen,1,d))*w));
	}

	return s.scale(1/N);
};

function wFun(x,v){
	var gamma = 30;
	var delta = 0.30;
	var q = 10;
	var sigma = 0.02;

	var d = 20;
	var s = gamma/Math.pow(q+x.length2(),sigma);
	var S1 = cutoff(v.length(),1/d,d);
	var S2 = 1-cutoff(Math.abs(x.normalize().dot(v.normalize())),1,delta)
	return s*(S1 + (1-S1)*S2);
};

function NablaU(x1,x2) {
	var cA = 100;
	var cR = 50;
	var lA = 200;
	var lR = 100;
	var r = Math.max(0.000000001,x1.distance(x2));

	var dU1 = cA*(x1.x-x2.x)*Math.exp(-r/lA)/(r*lA)-cR*(x1.x-x2.x)*Math.exp(-r/lR)/(r*lR);
	var dU2 = cA*(x1.y-x2.y)*Math.exp(-r/lA)/(r*lA)-cR*(x1.y-x2.y)*Math.exp(-r/lR)/(r*lR);
	return new Vec2(dU1, dU2);
};