Entity = function(seed, pos) {

	this.position = new Vec2(pos.x, pos.y);
	this.velocity = new Vec2(0, 0);
	this.acceleration = new Vec2(0, 0);
	this.direction = new Vec2(Math.cos(seed*2*Math.PI), Math.sin(seed*2*Math.PI));

	this.interpolatorX = new Interpolator([this.position.x, this.direction.x, 0, this.position.x + this.direction.x, 0]);
	this.interpolatorY = new Interpolator([this.position.y, this.direction.y, 0, this.position.y + this.direction.y, 0]);
	this.interpolationStart = Date.now();

	this.animationTime = seed;

	// default values, child classes fish and shark implement their own
	this.dimensions = [10, 8, 10, 5, 13, 2, 14, 7]; // length / width of head, body, butt, tail
	this.colors = ['#7fb7b8', '#1e8587', '#065456'];
	this.animationSpeed = 0.1;
};

Entity.prototype.Draw = function(ctx) {

	// movement data processing
	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());

	this.position.set(dataX[0].mod(App.CANVAS_WIDTH), dataY[0].mod(App.CANVAS_HEIGHT));

	var tmp = new Vec2(dataX[1], dataY[1]);
	if (tmp.length2() > 1)
		this.direction.copy(tmp).normalize();

	var aTmp = new Vec2(dataX[1] - this.velocity.x, dataY[1] - this.velocity.y);
	this.acceleration.scale(0.9).add(aTmp.scale(0.1));
	var aTangential = this.acceleration.dot(this.direction);
	var aNormal = this.acceleration.dot(this.direction.ortho());
	//this.velocity.set(dataX[1], dataY[1]);

	this.animationTime += 0.1 + Math.min(Math.abs(aTangential) / 50 + Math.abs(aNormal) / 20, 0.5);
	var scaledBodyLength = this.dimensions[1] - Math.abs(aNormal / 2);

	// anchor points
	var head = this.direction.clone().rotate(-Math.sin(this.animationTime) / 8 + aNormal / 40);
	var butt = this.direction.clone().scale(-1).rotate(Math.sin(this.animationTime) / 4);
	var tail = this.direction.clone().scale(-1).rotate(-Math.cos(this.animationTime) / 3);

	// body points
	var headTop = this.position.clone().addScaled(this.direction, scaledBodyLength).addScaled(head, this.dimensions[0]);
	var headRight = this.position.clone().addScaled(this.direction, scaledBodyLength).addScaled(head.ortho(), this.dimensions[1]);
	var headLeft = headRight.clone().addScaled(head.ortho(), -2*this.dimensions[1]);
	var bodyRight = this.position.clone().addScaled(this.direction.ortho(), this.dimensions[3]);
	var bodyLeft = this.position.clone().addScaled(this.direction.ortho(), -this.dimensions[3]);
	var buttRight = this.position.clone().addScaled(butt, this.dimensions[4]).addScaled(butt.ortho(), -this.dimensions[5]);
	var buttLeft = buttRight.clone().addScaled(butt.ortho(), 2*this.dimensions[5]);
	var tailRight = this.position.clone().addScaled(butt, this.dimensions[4]).addScaled(tail, this.dimensions[6]).addScaled(tail.ortho(), -this.dimensions[7]);
	var tailLeft = tailRight.clone().addScaled(tail.ortho(), 2*this.dimensions[7]);
	var tailMiddle = this.position.clone().addScaled(butt, this.dimensions[4]).addScaled(tail, this.dimensions[6] / 2);

	// drawing
	var torusPosition = this.GetTorusPosition();
	ctx.save();
	ctx.translate(-(this.position.x - torusPosition.x), -(this.position.y - torusPosition.y));
	this.DrawShape(ctx, [headTop, headRight, bodyRight, headTop, headLeft, bodyLeft], this.colors[0]);
	this.DrawShape(ctx, [headTop, bodyRight, buttRight, tailMiddle, buttLeft, bodyLeft], this.colors[1]);
	this.DrawShape(ctx, [tailMiddle, tailRight, buttRight, tailMiddle, tailLeft, buttLeft], this.colors[2]);
	ctx.restore();
};

// now a relative position update!
Entity.prototype.UpdatePosition = function(x, y) {

	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());

	var acc = new Vec2(-dataX[2], -dataY[2]);
	acc.normalize().scale(100);

	this.interpolatorX = new Interpolator([dataX[0], dataX[1], acc.x, dataX[0] + x, 0]);
	this.interpolatorY = new Interpolator([dataY[0], dataY[1], acc.y, dataY[0] + y, 0]);
	this.interpolationStart = Date.now();
};

Entity.prototype.GetTorusPosition = function() {
	return new Vec2(this.position.x.mod(App.CANVAS_WIDTH), this.position.y.mod(App.CANVAS_HEIGHT));
};

// gives distance between fish or shark while taking torus topology into account
Entity.prototype.DistanceTo = function(entity) {
	var p = this.GetTorusPosition();
	var ep = entity.GetTorusPosition();

	return Math.min(p.distance(ep),
					p.distance(ep.addXY(App.CANVAS_WIDTH, 0)),
					p.distance(ep.addXY(-2*App.CANVAS_WIDTH, 0)),
					p.distance(ep.addXY(App.CANVAS_WIDTH, App.CANVAS_HEIGHT)),
					p.distance(ep.addXY(0, -2*App.CANVAS_HEIGHT)));
};

// maybe update to this ^^^^^^ distance function?

Entity.prototype.isNeighbour = function(coords) {
	if(abs(abs(this.position.x-coords.x)-App.CELL) < 1 && abs(abs(this.position.y-coords.y)-App.CELL) < 1){
		return true;
	}
	else {
		return false;
	}
};

Entity.prototype.DrawShape = function(ctx, points, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	if (points.length != 0)
		ctx.moveTo(points[0].x, points[0].y);
	for (var i = 1; i < points.length; i++)
		ctx.lineTo(points[i].x, points[i].y);
	ctx.fill();
};

Entity.prototype.InterpolationTime = function() {
	var dt = Math.min(Math.max(Date.now() - this.interpolationStart, 0) / 2000, 1);
	return dt; //1 - (1 - dt)*(1 - dt); //return -2*dt*dt*dt + 3*dt*dt;
};

Entity.prototype.nextPosition = function(entityList,entityListFlee) {
	var h = 0.1;
	var vel = this.velocity.clone();
	var pos = this.position.clone();
	var f = this.fun(entityList,entityListFlee);
	this.velocity.setVec2(this.velocity.clone().add(f.scale(h)));
	//console.log(this.velocity);
	this.direction.setVec2(this.velocity.clone().normalize());
	vel.scale(h);
	return vel;
}

Entity.prototype.fun = function(entityList,entityListFlee) {
	var alpha = 0.07;
	var beta = 0.05;
	var m = 1;
	var N = entityList.length;
	var vel = this.velocity.clone();

	//console.log(vel);
	var s1 = vel.scale(alpha - beta*vel.length2());
	var s2 = new Vec2(0,0);
	//var Bi = this.B(entityList);
	var Ri = this.R(entityListFlee).scale(0.5);
	var Ri2 = this.R(entityList).scale(0.1);
	Ri.add(Ri2);
	//var Ai = this.A(entityList).scale(0.3);
	//var Si = this.S(entityListFlee).scale(10);
	//console.log(s1,Bi,Ri,Ai);
	//s1 = s1.add(Ri.add(Ai)).scale(1/m);
	//Erweiterte Cucker-Smale-Modelle
		/*
	// Cucker-Smale Partikel-Modell
	for(var i = 0; i < N; i++){
		if(this.position != entityList[i].position){
			var vel = entityList[i].direction.clone().sub(this.direction);
			var pos = entityList[i].position.clone().sub(this.position);
			var r = pos.length()
			s2 = s2.add(vel.scale(H(r)));
		}
	*/
	//Selbstantriebs, Abbremsungs, und Anziehungs–Abstoßungs-Partikel Modell
	for(var i = 0; i < N; i++){
		if(this.position != entityList[i].position){
			s2 = s2.add(NablaU(this.position,entityList[i].position));
		}
	}
	//console.log(s1,s2,Si);
	//return s2.scale(1/N);
	return s1.add(Ri.sub(s2));
}

function H(r){
	var k = 600;
	var sigma = 1000;
	var gamma = 1/20;

	return k/Math.pow(sigma+r*r,gamma);
}

Entity.prototype.S = function(entityList){
	var beta1 = 1/100;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = this.position.clone().sub(entityList[i].position);
		var rLen = r.length();
		var v = entityList[i].velocity.clone().sub(this.velocity)
		s = s.add(v.scale(1/(Math.pow(1+rLen,beta1))));
	}
	return s.scale(1/N);
}
Entity.prototype.R = function(entityList){
	var rho = 10;
	var beta1 = 1/5;
	var d = 200;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = this.position.clone().sub(entityList[i].position);
		var rLen = r.length();
		s = s.add(r.scale(cutoff(rLen,1,d)/(Math.pow(1+rLen*rLen,beta1))));
	}
	return s.scale(rho/N);
}

Entity.prototype.B = function(entityList){
	var d = 400;
	var N = entityList.length;
	var C = 10;

	var rho = 0;
	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = this.position.clone().sub(entityList[i].position);
		var rLen = r.length2();
		rho = rho + 1/(1+rLen);
	}
	rho = rho/N;
	var l = this.velocity.length();
	return this.velocity.ortho().scale(l*C*(1-cutoff(rho,1,d)));
}
function cutoff(x,v,d){
	return (1-Math.tanh(v*(x-d)))/2;
}

Entity.prototype.A = function(entityList){
	var d = 400;
	var N = entityList.length;

	var s = new Vec2(0,0);
	for(var i = 0; i < N;i++){
		var r = this.position.clone().sub(entityList[i].position);
		var v = entityList[i].velocity.clone().sub(this.velocity)
		var rLen = r.length();
		var w = wFun(r,this.velocity.clone());
		s = s.add(v.scale((1-cutoff(rLen,1,d))*w));
	}

	return s.scale(1/N);
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
	var r = Math.max(0.000000001,x1.distance(x2));

	var dU1 = cA*(x1.x-x2.x)*Math.exp(-r/lA)/(r*lA)-cR*(x1.x-x2.x)*Math.exp(-r/lR)/(r*lR);
	var dU2 = cA*(x1.y-x2.y)*Math.exp(-r/lA)/(r*lA)-cR*(x1.y-x2.y)*Math.exp(-r/lR)/(r*lR);
	return new Vec2(dU1, dU2);
}

// child classes fish and shark

Fish = function(seed, pos) {
	Entity.apply(this, arguments);

	this.velocity = new Vec2(0, 0);
	//this.dimensions = [10, 8, 10, 5, 13, 2, 14, 7]; // length / width of head, body, butt, tail
	this.dimensions = [5, 4, 5, 2, 6, 1, 7, 3]; // length / width of head, body, butt, tail
	var colorRange = [0.4, 0.6];
	this.colors = [	HSVtoRGB(colorRange[0] + seed*(colorRange[1] - colorRange[0]), 0.5, 0.8),
					HSVtoRGB(colorRange[0] + seed*(colorRange[1] - colorRange[0]), 0.7, 0.6),
					HSVtoRGB(colorRange[0] + seed*(colorRange[1] - colorRange[0]), 0.7, 0.5)];
	this.animationSpeed = 0.1;

	this.spawn = App.FISHSPAWN*Math.round(Math.random()*10);
}
Fish.prototype = Object.create(Entity.prototype);
Fish.prototype.constructor = Fish;

Shark = function(seed, pos) {
	Entity.apply(this, arguments);

	this.dimensions = [20, 13, 35, 7, 23, 4, 24, 14]; // length / width of head, body, butt, tail
	this.colors = ['#9097a0', '#70757c', '#565b63'];
	this.animationSpeed = 0.1;

	this.spawn = App.SHARKSPAWN;
	this.starving = App.SHARKSTARVE;
}
Shark.prototype = Object.create(Entity.prototype);
Shark.prototype.constructor = Shark;


// 5th order hermite interpolation for smooth movement

Interpolator = function(data) {

	var inverse = [	[3, 2, 1/2, -3, 1],
					[-4, -3, -1, 4, -1],
					[0, 0, 1/2, 0, 0],
					[0, 1, 0, 0, 0],
					[1, 0, 0, 0, 0]];

	this.coef = MatrixVectorMult(inverse, data);
};

Interpolator.prototype.Eval= function(t) {
	return [(((this.coef[0]*t + this.coef[1])*t + this.coef[2])*t + this.coef[3])*t + this.coef[4], // positions
			((4*this.coef[0]*t + 3*this.coef[1])*t + 2*this.coef[2])*t + this.coef[3], // velocities
			(12*this.coef[0]*t + 6*this.coef[1])*t + 2*this.coef[2]]; // curvature

};

// utility stuff

function MatrixVectorMult(mat, vec) {
	result = [];
	for (var i = 0; i < mat.length; i++) {
		tmp = 0;
		for (var j = 0; j < vec.length; j++) {
			tmp += mat[i][j] * vec[j];
		}
		result.push(tmp);
	}
	return result;
}

// javascript % operator is bullshit - returns crap for negative numbers

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
}

// hsv to rgb string

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return 	'rgb(' + Math.round(r * 255) + ',' + Math.round(g * 255) + ',' + Math.round(b * 255) + ')';
}
