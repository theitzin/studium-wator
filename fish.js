Entity = function(pos, behaviourData) {

	this.position = new Vec2(pos.x, pos.y);
	this.velocity = new Vec2(0, 0);
	this.acceleration = new Vec2(0, 0);
	var rnd = Math.random();
	this.direction = new Vec2(Math.cos(rnd*2*Math.PI), Math.sin(rnd*2*Math.PI));

	this.interpolatorX = new Interpolator([this.position.x, 0.1*this.direction.x, 0, this.position.x + this.direction.x, 0]);
	this.interpolatorY = new Interpolator([this.position.y, 0.1*this.direction.y, 0, this.position.y + this.direction.y, 0]);
	this.interpolationStart = Date.now();
	this.interpolationDuration = 2000;
	this.quadraticInterpolationTime = false;

	this.animationTime = Math.random();
	this.animationTimeIncrement = 0.1;
	this.behaviourData = behaviourData;

	// default values, child classes fish and shark implement their own
	this.dimensions = [10, 8, 10, 5, 13, 2, 14, 7]; // length / width of head, body, butt, tail
	this.colors = ['#7fb7b8', '#1e8587', '#065456']; // default
	this.animationSpeed = 0.1;

	// [headTop, headRight, headLeft, bodyRight, bodyLeft, buttRight, buttLeft, tailRight, tailLeft, tailMiddle]
	this.bodyPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // dummy values
};

Entity.prototype.CANVAS_WIDTH = 100; // default
Entity.prototype.CANVAS_HEIGHT = 100; // default
Entity.prototype.ANIMATED = true;

Entity.prototype.Draw = function(ctx, scale) {

	// movement data processing
	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());

	this.position.set(dataX[0], dataY[0]);
	var tmpDir = new Vec2(dataX[1], dataY[1]);
	if (tmpDir.length2() > 1)
		this.direction.copy(tmpDir).normalize();
	var tmpAcc = new Vec2(dataX[1] - this.velocity.x, dataY[1] - this.velocity.y);
	this.acceleration.scale(0.9).add(tmpAcc.scale(0.1));
	if (this.acceleration.length() > 100)
		this.acceleration.normalize().scale(100);

	if (Entity.prototype.ANIMATED) {
		this.UpdateBodyPoints();
	}
	else {
		this.animationTime += this.animationTimeIncrement;
	}

	// drawing
	var torusPosition = this.GetTorusPosition();
	ctx.save();
	ctx.translate(torusPosition.x, torusPosition.y);
	ctx.rotate(Math.atan2(this.direction.y, this.direction.x));
	ctx.scale(scale, scale);
	this.DrawShape(ctx, [0, 1, 3, 0, 2, 4], this.colors[0]);
	this.DrawShape(ctx, [0, 3, 5, 9, 6, 4], this.colors[1]);
	this.DrawShape(ctx, [9, 7, 5, 9, 8, 6], this.colors[2]);
	ctx.restore();
};

Entity.prototype.UpdateBodyPoints = function() {

	var aTangential = this.acceleration.dot(this.direction);
	var aNormal = this.acceleration.dot(this.direction.ortho());

	var scaledBodyLength = this.dimensions[1] - Math.abs(aNormal / 15);

	// anchor points
	var head = new Vec2(1, 0).rotate(-Math.sin(this.animationTime) / 8 - aNormal / 100);
	var butt = new Vec2(-1, 0).rotate(Math.sin(this.animationTime) / 4);
	var tail = new Vec2(-1, 0).rotate(-Math.cos(this.animationTime) / 3);

	// body points
	this.bodyPoints[0] = new Vec2(0, 0).addXY(scaledBodyLength, 0).addScaled(head, this.dimensions[0]);
	this.bodyPoints[1] = new Vec2(0, 0).addXY(scaledBodyLength, 0).addScaled(head.ortho(), this.dimensions[1]);
	this.bodyPoints[2] = this.bodyPoints[1].clone().addScaled(head.ortho(), -2*this.dimensions[1]);
	this.bodyPoints[3] = new Vec2(0, 0).addXY(0, this.dimensions[3]);
	this.bodyPoints[4] = new Vec2(0, 0).addXY(0, -this.dimensions[3]);
	this.bodyPoints[5] = new Vec2(0, 0).addScaled(butt, this.dimensions[4]).addScaled(butt.ortho(), -this.dimensions[5]);
	this.bodyPoints[6] = this.bodyPoints[5].clone().addScaled(butt.ortho(), 2*this.dimensions[5]);
	this.bodyPoints[7] = new Vec2(0, 0).addScaled(butt, this.dimensions[4]).addScaled(tail, this.dimensions[6]).addScaled(tail.ortho(), -this.dimensions[7]);
	this.bodyPoints[8] = this.bodyPoints[7].clone().addScaled(tail.ortho(), 2*this.dimensions[7]);
	this.bodyPoints[9] = new Vec2(0, 0).addScaled(butt, this.dimensions[4]).addScaled(tail, this.dimensions[6] / 2);

	this.animationTime += this.animationTimeIncrement + Math.min(Math.abs(aTangential) / 300 + Math.abs(aNormal) / 120, 0.5);
};

// now a relative position update!
Entity.prototype.UpdatePosition = function(x, y) {
	var goalX = this.interpolatorX.GoalValue();
	var goalY = this.interpolatorY.GoalValue();
	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());

	var acc = new Vec2(-dataX[2], -dataY[2]);
	acc.normalize().scale(100);

	this.interpolatorX = new Interpolator([dataX[0], dataX[1], acc.x, goalX + x, 0]);
	this.interpolatorY = new Interpolator([dataY[0], dataY[1], acc.y, goalY + y, 0]);
	this.interpolationStart = Date.now();
};

Entity.prototype.GetTorusPosition = function() {
	return new Vec2(this.position.x.mod(this.CANVAS_WIDTH), this.position.y.mod(this.CANVAS_HEIGHT));
};

// gives distance between fish or shark while taking torus topology into account
Entity.prototype.DistanceTo = function(entity) {

	var p = this.GetTorusPosition();
	var ep = entity.GetTorusPosition();

	return Math.min(p.distance(ep),
					p.distance(ep.addXY(this.CANVAS_WIDTH, 0)),
					p.distance(ep.addXY(-2*this.CANVAS_WIDTH, 0)),
					p.distance(ep.addXY(this.CANVAS_WIDTH, this.CANVAS_HEIGHT)),
					p.distance(ep.addXY(0, -2*this.CANVAS_HEIGHT)));
};

// list of body point indices
Entity.prototype.DrawShape = function(ctx, indices, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	if (indices.length != 0)
		ctx.moveTo(this.bodyPoints[indices[0]].x, this.bodyPoints[indices[0]].y);
	for (var i = 1; i < indices.length; i++)
		ctx.lineTo(this.bodyPoints[indices[i]].x, this.bodyPoints[indices[i]].y);
	ctx.fill();
};

Entity.prototype.InterpolationTime = function() {
	var dt = Math.min(Math.max(Date.now() - this.interpolationStart, 0) / this.interpolationDuration, 1);
	if (!this.quadraticInterpolationTime)
		return dt;
	else
		return  1 - (1 - dt)*(1 - dt);
};

// child classes fish and shark

Fish = function(pos, behaviourData) {
	Entity.apply(this, arguments);

	this.velocity = new Vec2(0, 0);
	this.dimensions = [10, 8, 10, 5, 13, 2, 14, 7] // length / width of head, body, butt, tail
	this.UpdateBodyPoints();
	var colorRange = [0.4, 0.6];
	var rnd = Math.random();
	this.colors = [	HSVtoRGB(colorRange[0] + rnd*(colorRange[1] - colorRange[0]), 0.7, 0.8),
					HSVtoRGB(colorRange[0] + rnd*(colorRange[1] - colorRange[0]), 0.9, 0.6),
					HSVtoRGB(colorRange[0] + rnd*(colorRange[1] - colorRange[0]), 0.9, 0.5)];
	this.animationSpeed = 0.1;

	this.spawn = 5; // default
}
Fish.prototype = Object.create(Entity.prototype);
Fish.prototype.constructor = Fish;

Shark = function(pos, behaviourData) {
	Entity.apply(this, arguments);

	this.dimensions = [20, 13, 35, 7, 23, 4, 24, 14] // length / width of head, body, butt, tail
	this.UpdateBodyPoints();
	this.colors = ['#9097a0', '#70757c', '#565b63'];
	this.animationSpeed = 0.1;
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
	this.goalValue = data[3];
};

Interpolator.prototype.Eval= function(t) {
	return [(((this.coef[0]*t + this.coef[1])*t + this.coef[2])*t + this.coef[3])*t + this.coef[4], // positions
			((4*this.coef[0]*t + 3*this.coef[1])*t + 2*this.coef[2])*t + this.coef[3], // velocities
			(12*this.coef[0]*t + 6*this.coef[1])*t + 2*this.coef[2]]; // curvature

};

Interpolator.prototype.GoalValue = function() {
	return this.goalValue;
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

function ZeroInit(n, m) {
	var matrix = [];
	for (var i = 0; i < n; i++) {
		matrix.push([]);
		for (var j = 0; j < m; j++) {
			matrix[i].push(0); // not occupied
		}
	}
	return matrix;
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