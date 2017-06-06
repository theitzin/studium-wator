
// abstract simulation mode class
SimulationMode = function(width, height) {
	this.WIDTH  = width;
  	this.HEIGHT = height;
  	this.TIMESTEP  = 1000; // default
  	this.lastUpdate = Date.now();

  	this.behaviour;
};

SimulationMode.prototype.Run = function(ctx) {
	var that = $("#play_pause_button .glyphicon");
	if(that.hasClass("glyphicon-pause")){
		var now = Date.now();
		if (now - this.lastUpdate > this.TIMESTEP) {
			this.Update();
			this.UpdatePlot();
			this.lastUpdate = now;
		}

		this.DrawEnvironment(ctx);
		this.DrawEntities(ctx);
}
};

SimulationMode.prototype.Init = function() {};
SimulationMode.prototype.Update = function() {};
SimulationMode.prototype.DrawEnvironment = function(ctx) {};
SimulationMode.prototype.DrawEntities = function(ctx) {};
SimulationMode.prototype.UpdatePlot = function() {};

// child classes of SimulationMode
// classic Wator
//
ClassicWator = function(width, height) {
	SimulationMode.apply(this, arguments);

  	this.NCELLS = parseInt($(".visible input[name=NCELLS").val());
  	this.CELL = this.WIDTH / this.NCELLS; // assuming width = height
  	this.INITIALFISH = Math.min(
  		parseInt($(".visible input[name=NFISH]").val()),
  		this.NCELLS * this.NCELLS);
  	this.INITIALSHARK = Math.min(
  		parseInt($(".visible input[name=NSHARK]").val()),
  		this.NCELLS * this.NCELLS - this.INITIALFISH);

  	this.nshark = this.INITIALSHARK;
  	this.nfish = this.INITIALFISH;

  	this.TIMESTEP = 2000;

  	this.iteration = 0;
  	this.grid = [];
  	this.behaviour = new RuleBased(this.CELL);
  	this.voronoi = new Voronoi(this.WIDTH, this.HEIGHT);

  	this.Init();
};
ClassicWator.prototype = Object.create(SimulationMode.prototype);
ClassicWator.prototype.constructor = ClassicWator;

ClassicWator.prototype.Init = function() {
	this.grid = ZeroInit(this.NCELLS, this.NCELLS);

	it = new RandomIterator(this.NCELLS * this.NCELLS);
	for (var cnt = 0, k = it.Next(); cnt < this.INITIALFISH; cnt++, k = it.Next()) {
		[i, j] = [k % this.NCELLS, Math.floor(k / this.NCELLS)];

		canvasPosition = new Vec2(i, j).scale(this.CELL).addXY(this.CELL / 2, this.CELL / 2);
		behaviourData = { "age" : Math.floor(Math.random() * this.behaviour.FBRUT), "iteration" : 0 };
		this.grid[i][j] = new Fish(canvasPosition, behaviourData);
	}

	for (var cnt = 0; cnt < this.INITIALSHARK; cnt++, k = it.Next()) {
		[i, j] = [k % this.NCELLS, Math.floor(k / this.NCELLS)];

		canvasPosition = new Vec2(i, j).scale(this.CELL).addXY(this.CELL / 2, this.CELL / 2);
		behaviourData = { "age" : Math.floor(Math.random() * this.behaviour.HBRUT), "fasten" : 0, "iteration" : 0 };
		this.grid[i][j] = new Shark(canvasPosition, behaviourData);
	}
};

ClassicWator.prototype.Update = function() {
	this.iteration++;

	// move shark first to allow them to catch fish
	for (var i, j, it = new RandomIterator(this.NCELLS * this.NCELLS), k = it.Next(); !it.Empty(); k = it.Next()) {
		[i, j] = [k % this.NCELLS, Math.floor(k / this.NCELLS)];
		if (this.grid[i][j] instanceof Shark) {
			this.behaviour.NextPosition(i, j, this.grid, this.iteration);
		}
	}

	for (var i, j, it = new RandomIterator(this.NCELLS * this.NCELLS), k = it.Next(); !it.Empty(); k = it.Next()) {
		[i, j] = [k % this.NCELLS, Math.floor(k / this.NCELLS)];
		if (this.grid[i][j] instanceof Fish) {
			this.behaviour.NextPosition(i, j, this.grid, this.iteration);
		}
	}

	this.nfish = 0;
	this.nshark = 0;
	for (var i = 0; i < this.NCELLS; i++) {
		for (var j = 0; j < this.NCELLS; j++) {
			if (this.grid[i][j] instanceof Fish) {
				this.nfish++;
			}
			if (this.grid[i][j] instanceof Shark) {
				this.nshark++;
			}
		}
	}
};

ClassicWator.prototype.DrawEnvironment = function(ctx) {
	this.voronoi.Draw(ctx);
	for (var i = 1; i < this.NCELLS; i++) {
		this.DrawLine(ctx, new Vec2(i * this.CELL, 0), new Vec2(i * this.CELL, this.HEIGHT));
	}

	for (var i = 1; i < this.NCELLS; i++) {
		this.DrawLine(ctx, new Vec2(0, i * this.CELL), new Vec2(this.WIDTH, i * this.CELL));
	}
};

ClassicWator.prototype.DrawEntities = function(ctx) {
	for (var i = 0; i < this.NCELLS; i++) {
		for (var j = 0; j < this.NCELLS; j++){
			if (this.grid[i][j] != 0) {
				this.grid[i][j].Draw(ctx, this.CELL / 70);
			}
		}
	}
};

ClassicWator.prototype.UpdatePlot = function() {
	App.PopulationPlot.Update(this.nfish, this.nshark, this.TIMESTEP / 1000);
};


ClassicWator.prototype.GetRandomPosition = function() {
	var x = Math.floor(Math.random()*(this.NCELLS-1));
	var y = Math.floor(Math.random()*(this.NCELLS-1));

	return new Vec2(x, y);
};

ClassicWator.prototype.DrawLine = function(ctx, p1, p2) {
	ctx.strokeStyle="#404040";
	ctx.lineWidth = 0.5;
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

		this.NSHARK  = parseInt($(".visible input[name=NSHARK]").val());
		this.NFISH  = parseInt($(".visible input[name=NFISH]").val());
		this.MAXFISH  = parseInt($(".visible input[name=NFISH]").data('max-value'));
		this.MAXSHARK  = parseInt($(".visible input[name=NSHARK]").data('max-value'));
		this.SHARKSTARVE  = parseInt($(".visible input[name=SHARKSTARVE]").val());
		this.SHARKSPAWN  = parseInt($(".visible input[name=SHARKSPAWN]").val());
		this.FISHSPAWN  = parseInt($(".visible input[name=FISHSPAWN]").val());
		this.FISHAGE = parseInt($(".visible input[name=FISHAGE]").val());

    this.sharks = [];
    this.fishes = [];
    this.behaviour = new SwarmBehaviour();
    this.voronoi = new Voronoi(this.WIDTH, this.HEIGHT);

    this.Init();
};

ContinuousWator.prototype = Object.create(SimulationMode.prototype);
ContinuousWator.prototype.constructor = ContinuousWator;

ContinuousWator.prototype.Init = function() {
	pos = this.GetRandPos();

	for(var i = 0; i < this.NSHARK; i++) {
		behaviourData = { "spawn": Math.round(this.SHARKSPAWN*Math.random()), "starving": this.SHARKSTARVE };
		this.sharks.push(new Shark(pos[i], behaviourData));
	}

	for(var i = this.NSHARK; i < this.NSHARK + this.NFISH; i++) {
		behaviourData = { "spawn": Math.round(this.FISHSPAWN*Math.random()), "age": Math.round(this.FISHAGE*Math.random()) };
		this.fishes.push(new Fish(pos[i], behaviourData));
	}
};

ContinuousWator.prototype.Update = function() {
	this.FishSwim(this.fishes,this.sharks);
	this.SharkSwim(this.fishes,this.sharks);
};

ContinuousWator.prototype.DrawEnvironment = function(ctx) {
	this.voronoi.Draw(ctx);
};

ContinuousWator.prototype.DrawEntities = function(ctx) {
	for(var i = 0; i < this.fishes.length; i++){
		this.fishes[i].Draw(ctx, 0.5);
	}
	for(var i = 0; i < this.sharks.length; i++){
		this.sharks[i].Draw(ctx, 0.5);
	}
};

ContinuousWator.prototype.UpdatePlot = function() {
	App.PopulationPlot.Update(
		this.fishes.length / this.MAXFISH,
		this.sharks.length / this.MAXSHARK,
		this.TIMESTEP / 1000);
};

ContinuousWator.prototype.FishSwim = function(f,s){
	for(var i = 0; i < f.length; i++){
		if(f[i].behaviourData["age"] <= 0){
			f.splice(i, 1);
		}
		else{
			f[i].behaviourData["age"] -= 1;
		}
	}
	for(var i = 0; i < f.length; i++){
    var move = this.behaviour.NextPosition(f[i], f,s);
    if(f[i].behaviourData["spawn"] <= 0){
			if(f.length < this.MAXFISH){
	    	behaviourData = { "spawn": this.FISHSPAWN, "age": this.FISHAGE};
		    f.push(new Fish(f[i].position, behaviourData));
		    f[i].behaviourData["spawn"] = this.FISHSPAWN;
			} else{
				f[i].behaviourData["spawn"] += 1;
			}
    }
    else {
      	f[i].behaviourData["spawn"] -= 1;
    }
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
		var ind = null;
		var goTo = null;
		var minDist = 400;
		for(var j = 0; j < f.length; j++){
			var dist = s[i].DistanceTo(f[j]);
			if(dist < minDist) {
				if(dist < this.TOL){
					ind = j;
					break;
				}
				goTo = f[j].GetTorusPosition();
			}
		}
		if(ind == null){
			if(goTo == null){
				var direction = s[i].direction;
				var moveX = direction.x * 150 + (Math.round(Math.random())*2-1)*this.CELL;
				var moveY = direction.y * 150 + (Math.round(Math.random())*2-1)*this.CELL;
			} else {
				var dir = goTo.sub(s[i].GetTorusPosition());
				var moveX = dir.normalize().scale(50).x;
				var moveY = dir.normalize().scale(50).y;
			}
			s[i].behaviourData["starving"] -= 1;
		}
		else {
			var dir = f[ind].GetTorusPosition().sub(s[i].GetTorusPosition());
			var dirX = dir.x;
			var dirY = dir.y;
			// when shark sees fish on other side
			if(Math.abs(dirX) > this.TOL){
				var moveX = dirX - Math.sign(dirX)*this.WIDTH;
			} else {
				var moveX = dirX;
			}
			if(Math.abs(dirY) > this.TOL){
				var moveY = dirY - Math.sign(dirY)*this.HEIGHT;
			} else {
				var moveY = dirY;
			}
			s[i].behaviourData["starving"] = this.SHARKSTARVE;
			f.splice(ind, 1);
		}
		if(s[i].behaviourData["spawn"] <= 0){
			if(s.length < this.MAXSHARK){
				behaviourData = { "spawn": this.SHARKSPAWN, "starving": this.SHARKSTARVE };
		  	s.push(new Shark(s[i].position, behaviourData));
		  	s[i].behaviourData["spawn"] = this.SHARKSPAWN;
			} else {
				s[i].behaviourData["spawn"] += 1;
			}
		}
		else {
		  	s[i].behaviourData["spawn"] -= 1;
		}
		s[i].UpdatePosition(moveX,moveY)
	}
};

ContinuousWator.prototype.GetRandPos = function() {
	r = [];
	while(r.length < this.NSHARK+this.NFISH){
		var trig = false;
		var x = Math.ceil(Math.random()*(this.WIDTH-1));
		var y = Math.ceil(Math.random()*(this.HEIGHT-1));
		pos = new Vec2(x, y);
		for(var i = 0; i < r.length; i++){
			if(r[i].x == pos.x && r[i].y == pos.y) trig = true;
		}
		if(trig) continue;
		r[r.length] = pos;
	}
	return r;
};


// pet mode
//
PetWator = function(width, height) {
	SimulationMode.apply(this, arguments);

  	this.TIMESTEP = 300;
  	this.mousePosition = new Vec2(width / 2, height / 2);
  	this.fish = new Fish(new Vec2(width / 2, height / 2), {});
  	this.voronoi = new Voronoi(this.WIDTH, this.HEIGHT);

  	this.Init();
};
PetWator.prototype = Object.create(SimulationMode.prototype);
PetWator.prototype.constructor = PetWator;

PetWator.prototype.Init = function() {
	this.fish.colors = ["rgb(234, 189, 75)", "rgb(206, 160, 35)", "rgb(181, 127, 12)"];
	//this.fish.interpolationDuration = 1000;
	this.fish.quadraticInterpolationTime = true;


	App.canvas.addEventListener('mousemove', function(e) {
		var rect = canvas.getBoundingClientRect();
    	var x = event.clientX - rect.left;
    	var y = event.clientY - rect.top;
    	if (App.SimulationMode instanceof PetWator)
			App.SimulationMode.UpdateMousePosition(x, y);
	});
};

PetWator.prototype.UpdateMousePosition = function(x, y) {
	this.mousePosition = new Vec2(x, y);
};

PetWator.prototype.Update = function() {
	var goal = new Vec2 (this.fish.interpolatorX.GoalValue(), this.fish.interpolatorY.GoalValue());

	if (this.mousePosition.distance(goal) > 5) {
		this.fish.UpdatePosition(
			this.mousePosition.x - goal.x,
			this.mousePosition.y - goal.y);
	}
};

PetWator.prototype.DrawEnvironment = function(ctx) {
	this.voronoi.Draw(ctx);
};

PetWator.prototype.DrawEntities = function(ctx) {
	this.fish.Draw(ctx, 2.5);
};

PetWator.prototype.UpdatePlot = function() {
};



// behaviour class
// provides abstract interface for rule based classic wator behaviour or swarm behaviour
Behaviour = function () {};
Behaviour.prototype.Init = function() {};
Behaviour.prototype.NextPosition = function() {};



RuleBased = function(cellSize) {
	Behaviour.apply(this, arguments);

	this.CELLSIZE = cellSize;
	this.FBRUT = parseInt($(".visible input[name=FISHSPAWN]").val());
	this.HBRUT = parseInt($(".visible input[name=SHARKSPAWN]").val());
	this.FASTEN = parseInt($(".visible input[name=SHARKSTARVE]").val());

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
			var behaviourData = { "age" : Math.floor(Math.random() * this.FBRUT), "iteration" : iteration };
			var canvasPosition = new Vec2(x, y).scale(this.CELLSIZE).addXY(this.CELLSIZE / 2, this.CELLSIZE / 2);
			grid[x][y] = new Fish(canvasPosition, behaviourData);
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
			var behaviourData = { "age" : Math.floor(Math.random() * this.HBRUT), "fasten" : 0, "iteration" : iteration };
			var canvasPosition = new Vec2(x, y).scale(this.CELLSIZE).addXY(this.CELLSIZE / 2, this.CELLSIZE / 2);
			grid[x][y] = new Shark(canvasPosition, behaviourData);
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
	entity.direction.setVec2(entity.velocity.clone().normalize());
	vel.scale(50*h);
	return vel;
}

SwarmBehaviour.prototype.fun = function(entity, entityList,entityListFlee) {
	var alpha = 0.07;
	var beta = 0.05;
	var m = 1;
	var N = entityList.length;
	var vel = entity.velocity.clone();

	//Erweiterte Cucker-Smale-Modelle
	var Ei = vel.scale(alpha - beta*vel.length2());
	var RiShark = this.R(entity, entityListFlee, 50, 1/3);
	var RiEigen = this.R(entity, entityList, 0, 1);
	var Ai = this.A(entity, entityList);
	var Bi = this.B(entity, entityList);

	//var Si = this.S(entity, entityListFlee);
	//Selbstantriebs, Abbremsungs, und Anziehungs–Abstoßungs-Partikel Modell
	// for(var i = 0; i < N; i++){
	// 	if(entity.position != entityList[i].position){
	// 		s2 = s2.add(NablaU(entity.position,entityList[i].position));
	// 	}
	// }
	return Ei.add(RiEigen.add(RiShark.add(Ai.add(Bi))));
}

SwarmBehaviour.prototype.S = function(entity, entityList){
	var beta1 = 1/100;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var rLen = r.length();
		var v = entityList[i].velocity.clone().sub(entity.velocity)
		s = s.add(v.scale(1/(N*Math.pow(1+rLen,beta1))));
	}
	return s;
};

SwarmBehaviour.prototype.R = function(entity, entityList, int, distInt){
	var rho = int;
	var beta1 = distInt;
	var d = 200;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var rLen = r.length();
		s = s.add(r.scale(cutoff(rLen,1,d)/(N*Math.pow(1+rLen*rLen,beta1))));
	}
	return s.scale(rho);
};

SwarmBehaviour.prototype.B = function(entity, entityList){
	var d = 0.001;
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
	var d = 500;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var v = entityList[i].velocity.clone().sub(entity.velocity)
		var rLen = r.length();
		var w = wFun(r,entity.velocity.clone());
		s = s.add(r.scale((cutoff(rLen,100,d)-1)*w/N));
	}
	return s;
};

function wFun(x,v){
	var gamma = 1000;
	var delta = 0.30;
	var q = 20;
	var sigma = 1/5;

	var d = 10;
	var s = gamma/Math.pow(q+x.length2(),sigma);
	var S1 = cutoff(v.length(),1,d);
	var S2 = 1-cutoff(Math.abs(x.normalize().dot(v.normalize())),10,delta)
	return s*(S1 + (1-S1)*S2);
};


Voronoi = function(width, height) {
	var sites = d3.range(150).map(function() {
		return [Math.random() * width, Math.random() * height]; });

	var voronoi = d3.voronoi().extent([[0, 0], [width, height]]);
	var relaxedSites = voronoi(sites).polygons().map(d3.polygonCentroid);
	var diagram = voronoi(relaxedSites);

	this.polygons = diagram.polygons();
	var colorRange = [[0.53, 0.67, 1], [0.57, 0.63, 0.8]];
	this.colors = [];
	for (var i = 0; i < this.polygons.length; i++) {
		var t = this.polygons[i][0][0] / 1000;
		this.colors.push(HSVtoRGB(	colorRange[0][0] + t*(colorRange[1][0] - colorRange[0][0]),
									colorRange[0][1] + t*(colorRange[1][1] - colorRange[0][1]),
									colorRange[0][2] + t*(colorRange[1][2] - colorRange[0][2])));
	}
};

Voronoi.prototype.Draw = function(ctx) {
	for (var i = 0; i < this.polygons.length; i++) {
		ctx.fillStyle = this.colors[i];
		ctx.beginPath();
		if (this.polygons[i].length != 0)
			ctx.moveTo(this.polygons[i][0][0], this.polygons[i][0][1]);
		for (var j = 1; j < this.polygons[i].length; j++)
			ctx.lineTo(this.polygons[i][j][0], this.polygons[i][j][1]);
		ctx.fill();
	}
};
