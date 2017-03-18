
// abstract simulation mode class
SimulationMode = function(width, height) {
	this.WIDTH  = width;
  	this.HEIGHT = height;

  	this.behaviour;
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
  	this.NSHARK  = 0;
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

    this.lastUpdate = Date.now();
    this.Init();
};

ContinuousWator.prototype = Object.create(SimulationMode.prototype);
ContinuousWator.prototype.constructor = ContinuousWator;

ContinuousWator.prototype.Init = function() {
	pos = this.GetRandPos();

	for(var i = 0; i < this.NSHARK; i++) {
		this.sharks.push(new Shark(Math.random(),pos[i]));
		this.sharks[this.sharks.length - 1].spawn = Math.round(this.SHARKSPAWN*Math.random());;
		this.sharks[this.sharks.length - 1].starving = this.SHARKSTARVE;
	}

	for(var i = this.NSHARK; i < this.NSHARK + this.NFISH; i++) {
		this.fishes.push(new Fish(Math.random(),pos[i]));
		this.fishes[this.fishes.length - 1].spawn = Math.round(this.FISHSPAWN*Math.random());
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
		updatePlot(this.fishes.length/this.MAXFISH,this.sharks.length/this.MAXSHARK);
		this.lastUpdate = now;
	}
};

ContinuousWator.prototype.FishSwim = function(f,s){
	for(var i = 0; i < f.length; i++){
		if(f[i].age <= 0){
			f.splice(i, 1);
		}
		else{
			f[i].age -= 1;
		}
	}
	for(var i = 0; i < f.length; i++){

	    var move = this.behaviour.NextPosition(f[i],f,s);
	    if(f[i].spawn <= 0 && f.length < this.MAXFISH){
		    f.push(new Fish(Math.random(),f[i].position));
		    f[i].spawn = this.FISHSPAWN;
	    }
	    else if(f.length > this.MAXFISH){
	      	f[i].spawn += 1;
	    }
	    else {
	      	f[i].spawn -= 1;
	    }
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
    var direction = s[i].direction;
    var ind = null;
    var goTo = null;
    var minDist = 100;
    for(var j = 0; j < f.length; j++){
      var dist = s[i].DistanceTo(f[j]);
      if(dist < minDist) {
        if(dist < this.TOL){
          ind = j;
          break;
        }
        goTo = f[j].position;
      }
    }
    if(ind == null){
      /*
      var move = s[i].nextPosition(s,[]).scale(10);
      var moveX = move.x;
      var moveY = move.y;
      */
      if(goTo == null){
    		var moveX = direction.x * 150 + (Math.round(Math.random())*2-1)*this.CELL;
    		var moveY = direction.y * 150 + (Math.round(Math.random())*2-1)*this.CELL;
      } else {
        var moveX = (goTo.x - s[i].position.x)*0.5;
        var moveY = (goTo.y - s[i].position.y)*0.5;
      }
      s[i].starving -= 1;
    }
    else {
      var dirX = f[ind].position.x - s[i].position.x;
      var dirY = f[ind].position.y - s[i].position.y;
      // when shark sees fish on other side
      if(Math.abs(dirX) > this.TOL){
        var moveX = dirX - Math.sign(dirX)*this.CANVAS_WIDTH;
      } else {
        var moveX = f[ind].position.x - s[i].position.x;
      }
      if(Math.abs(dirY) > this.TOL){
        var moveY = dirY - Math.sign(dirY)*this.CANVAS_HEIGHT;
      } else {
        var moveY = f[ind].position.y - s[i].position.y;
      }
      s[i].starving = this.SHARKSTARVE;
      f.splice(ind, 1);
    }
		if(s.length < this.MAXSHARK){
      if(s[i].spawn <= 0){

    		var X = s[i].position.x + direction.x * 150 + 2*(Math.round(Math.random())*2-1)*this.CELL;
    		var Y = s[i].position.y + direction.y * 150 + 2*(Math.round(Math.random())*2-1)*this.CELL;

        s.push(new Shark(Math.random(),new Vec2(X,Y)));
        s[i].spawn = this.SHARKSPAWN;
      }
      else {
        s[i].spawn -= 1;
      }
    } else {
      s[i].spawn += 1;
    }
    s[i].UpdatePosition(moveX,moveY)
	}
};

ContinuousWator.prototype.GetRandPos = function(){
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



// behaviour class
// provides abstract interface for rule based classic wator behaviour or swarm behaviour
Behaviour = function () {};
Behaviour.prototype.Init = function() {};
Behaviour.prototype.NextPosition = function(entity, swarm, predators) {};


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
	vel.scale(100*h);
	return vel;
}

SwarmBehaviour.prototype.fun = function(entity, entityList,entityListFlee) {
	var alpha = 0.07;
	var beta = 0.05;
	var m = 1;
	var N = entityList.length;
	var vel = entity.velocity.clone();

	//Erweiterte Cucker-Smale-Modelle
	var s1 = vel.scale(alpha - beta*vel.length2());
	var s2 = new Vec2(0,0);
	var Ri = this.R(entity, entityListFlee).scale(0.5);
	var Ri2 = this.R(entity, entityList).scale(0.3);
	if(isNaN(Ri.y)){
		console.log("y",Ri);
	}
	Ri.add(Ri2);

	//var Ai = this.A(entity, entityList);
	//var Bi = entity.B(entityList);
	//var Si = this.S(entity, entityListFlee);
	//s1 = s1.add(Ri.add(Ai)).scale(1/m);
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
	return s1.add(Ri.sub(s2));
}

function H(r){
	var k = 600;
	var sigma = 1000;
	var gamma = 1/20;

	return k/Math.pow(sigma+r*r,gamma);
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
}
SwarmBehaviour.prototype.R = function(entity, entityList){
	var rho = 10;
	var beta1 = 1/5;
	var d = 200;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var rLen = r.length();
		s = s.add(r.scale(cutoff(rLen,1,d)/(N*Math.pow(1+rLen*rLen,beta1))));
	}
	return s.scale(rho);
}

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
}
function cutoff(x,v,d){
	return (1-Math.tanh(v*(x-d)))/2;
}

SwarmBehaviour.prototype.A = function(entity, entityList){
	var d = 400;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = entity.position.clone().sub(entityList[i].position);
		var v = entityList[i].velocity.clone().sub(entity.velocity)
		var rLen = r.length();
		var w = wFun(r,entity.velocity.clone());
		s = s.add(v.scale((1-cutoff(rLen,1,d))*w/N));
	}

	return s;
}


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
}

function NablaU(x1,x2) {
	var cA = 100;
	var cR = 50;
	var lA = 200;
	var lR = 100;
	var r = Math.max(0.00000000001,x1.distance(x2));

	var dU1 = cA*(x1.x-x2.x)*Math.exp(-r/lA)/(r*lA)-cR*(x1.x-x2.x)*Math.exp(-r/lR)/(r*lR);
	var dU2 = cA*(x1.y-x2.y)*Math.exp(-r/lA)/(r*lA)-cR*(x1.y-x2.y)*Math.exp(-r/lR)/(r*lR);
	return new Vec2(dU1, dU2);
}
