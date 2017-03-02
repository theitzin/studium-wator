Fish = function() {
	this.posX = 100;
	this.posY = 100;
	this.interpolator = new Interpolator([this.posX, this.posX, 0], [this.posY, this.posY, 0]);
	this.interpolationStart = Date.now();
};

Fish.prototype.Draw = function(ctx) {

	var data = this.interpolator.Eval(this.InterpolationTime());
	this.posX = data[0];
	this.posY = data[1];

	ctx.beginPath();
	ctx.arc(this.posX, this.posY, 10, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#20E020';
	ctx.fill();
	ctx.strokeStyle = '#ff0000';
	ctx.beginPath();
	ctx.moveTo(this.posX, this.posY);
	ctx.lineTo(this.posX + data[2] / 10, this.posY + data[3] / 10);
	ctx.stroke();
};

Fish.prototype.UpdatePosition = function(x, y) {

	var data = this.interpolator.Eval(this.InterpolationTime());
	var velocityAbs = Math.sqrt(data[2]*data[2] + data[3]*data[3]);
	var velocityScalar = velocityAbs == 0 ? 1 : 100 / velocityAbs;
	this.interpolator = new Interpolator([data[0], x, data[2] * velocityScalar], [data[1], y, data[3] * velocityScalar]);
	this.interpolationStart = Date.now();
};

Fish.prototype.InterpolationTime = function() {
	var dt = Math.min(Math.max(Date.now() - this.interpolationStart, 0) / 1000, 1);
	return 1 - (1 - dt)*(1 - dt); //return -2*dt*dt*dt + 3*dt*dt;
};


// cubic interpolation for smooth movement

Interpolator = function(dataX, dataY) {

	var invMat = [[-1, 1, -1], [0, 0, 1], [1, 0, 0]];

	this.coefX = MatrixVectorMult(invMat, dataX);
	this.coefY = MatrixVectorMult(invMat, dataY);
};

Interpolator.prototype.Eval= function(t) {
	return [	this.coefX[0]*t*t + this.coefX[1]*t + this.coefX[2], // positions
				this.coefY[0]*t*t + this.coefY[1]*t + this.coefY[2],
				2*this.coefX[0]*t + this.coefX[1],// velocities
				2*this.coefY[0]*t + this.coefY[1]];
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