Fish = function(seed) {
	this.position = new Vec2(100, 100);
	this.direction = new Vec2(Math.cos(seed*2*Math.PI), Math.sin(seed*2*Math.PI));
	this.interpolatorX = new Interpolator([this.position.x, 0, 0, this.position.x, 0]);
	this.interpolatorY = new Interpolator([this.position.y, 0, 0, this.position.y, 0]);
	this.interpolationStart = Date.now();

	this.headLength = 20;
	this.bodyLength = 35;
	this.buttLength = 23;
	this.tailLength = 24;
	this.headWidth = 13;
	this.bodyWidth = 7;
	this.buttWidth = 4;
	this.tailWidth = 14;
	this.butt;
	this.tail;

	this.animationtime = Date.now() / 1000;
	this.velocityOld = new Vec2(0, 0);
	this.acceleration = new Vec2(0, 0);
};

Fish.prototype.Draw = function(ctx) {

	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());
	this.position.set(dataX[0], dataY[0]);
	var tmp = new Vec2(dataX[1], dataY[1]);
	if (tmp.length2() > 1)
		this.direction.copy(tmp).normalize();

	var aTmp = new Vec2(dataX[1] - this.velocityOld.x, dataY[1] - this.velocityOld.y);
	this.acceleration.scale(0.9).add(aTmp.scale(0.08));
	var aTangential = this.acceleration.dot(this.direction);
	var aNormal = this.acceleration.dot(this.direction.ortho());
	this.velocityOld.set(dataX[1], dataY[1]);

	this.animationtime += 0.1 + Math.min(Math.abs(aTangential) / 50 + Math.abs(aNormal) / 40, 0.5);

	this.head = this.direction.clone().rotate(-Math.sin(this.animationtime) / 8 + aNormal / 40);
	this.butt = this.direction.clone().scale(-1).rotate(Math.sin(this.animationtime) / 4);
	this.tail = this.direction.clone().scale(-1).rotate(-Math.cos(this.animationtime) / 3);
	var scaledBodyLength = this.bodyLength - Math.abs(aNormal / 2);

	var headTop = this.position.clone().addScaled(this.direction, scaledBodyLength).addScaled(this.head, this.headLength);
	var headRight = this.position.clone().addScaled(this.direction, scaledBodyLength).addScaled(this.head.ortho(), this.headWidth);
	var headLeft = headRight.clone().addScaled(this.head.ortho(), -2*this.headWidth);
	var bodyRight = this.position.clone().addScaled(this.direction.ortho(), this.bodyWidth);
	var bodyLeft = this.position.clone().addScaled(this.direction.ortho(), -this.bodyWidth);
	var buttRight = this.position.clone().addScaled(this.butt, this.buttLength).addScaled(this.butt.ortho(), -this.buttWidth);
	var buttLeft = buttRight.clone().addScaled(this.butt.ortho(), 2*this.buttWidth);
	var tailRight = this.position.clone().addScaled(this.butt, this.buttLength).addScaled(this.tail, this.tailLength).addScaled(this.tail.ortho(), -this.tailWidth);
	var tailLeft = tailRight.clone().addScaled(this.tail.ortho(), 2*this.tailWidth);
	var tailMiddle = this.position.clone().addScaled(this.butt, this.buttLength).addScaled(this.tail, this.tailLength / 2);

	ctx.fillStyle = '#9097a0';
	ctx.beginPath();
	ctx.moveTo(headTop.x, headTop.y);
	ctx.lineTo(headRight.x, headRight.y);
	ctx.lineTo(bodyRight.x, bodyRight.y);
	ctx.lineTo(headTop.x, headTop.y);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(headTop.x, headTop.y);
	ctx.lineTo(headLeft.x, headLeft.y);
	ctx.lineTo(bodyLeft.x, bodyLeft.y);
	ctx.lineTo(headTop.x, headTop.y);
	ctx.fill();
	ctx.fillStyle = '#70757c';
	ctx.beginPath();
	ctx.moveTo(headTop.x, headTop.y);
	ctx.lineTo(bodyRight.x, bodyRight.y);
	ctx.lineTo(buttRight.x, buttRight.y);
	ctx.lineTo(tailMiddle.x, tailMiddle.y);
	ctx.lineTo(buttLeft.x, buttLeft.y);
	ctx.lineTo(bodyLeft.x, bodyLeft.y);
	ctx.lineTo(headTop.x, headTop.y);
	ctx.fill();
	ctx.fillStyle = '#565b63';
	ctx.beginPath();
	ctx.moveTo(tailMiddle.x, tailMiddle.y);
	ctx.lineTo(tailRight.x, tailRight.y);
	ctx.lineTo(buttRight.x, buttRight.y);
	ctx.lineTo(tailMiddle.x, tailMiddle.y);
	ctx.fill();
	ctx.moveTo(tailMiddle.x, tailMiddle.y);
	ctx.lineTo(tailLeft.x, tailLeft.y);
	ctx.lineTo(buttLeft.x, buttLeft.y);
	ctx.lineTo(tailMiddle.x, tailMiddle.y);
	ctx.fill();

	/*ctx.strokeStyle = '#ff0000';
	ctx.beginPath();
	ctx.moveTo(this.position.x, this.position.y);
	ctx.lineTo(this.position.x + dataX[1] / 10, this.position.y + dataY[1] / 10);
	ctx.stroke();*/

	/*ctx.beginPath();
	ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#20E020';
	ctx.fill();*/
};

Fish.prototype.UpdatePosition = function(x, y) {

	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());

	var acc = new Vec2(-dataX[2], -dataY[2]);
	acc.normalize().scale(100);

	this.interpolatorX = new Interpolator([dataX[0], dataX[1], acc.x, x, 0]);
	this.interpolatorY = new Interpolator([dataY[0], dataY[1], acc.y, y, 0]);
	this.interpolationStart = Date.now();
};

Fish.prototype.InterpolationTime = function() {
	var dt = Math.min(Math.max(Date.now() - this.interpolationStart, 0) / 2000, 1);
	return 1 - (1 - dt)*(1 - dt); //return -2*dt*dt*dt + 3*dt*dt;
};


// cubic interpolation for smooth movement

Interpolator = function(data) {

	var inverse = [	[3, 2, 1/2, -3, 1], 
					[-4, -3, -1, 4, -1], 
					[0, 0, 1/2, 0, 0], 
					[0, 1, 0, 0, 0], 
					[1, 0, 0, 0, 0]];

	this.coef = MatrixVectorMult(inverse, data);
};

Interpolator.prototype.Eval= function(t) {
	return [	this.coef[0]*t*t*t*t + this.coef[1]*t*t*t + this.coef[2]*t*t + this.coef[3]*t + this.coef[4], // positions
				4*this.coef[0]*t*t*t + 3*this.coef[1]*t*t + 2*this.coef[2]*t + this.coef[3], // velocities
				12*this.coef[0]*t*t + 6*this.coef[1]*t + 2*this.coef[2]]; // curvature

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