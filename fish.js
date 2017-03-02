Fish = function() {
	this.posX = 100;
	this.posY = 100;
	this.interpolatorX = new Interpolator([this.posX, 0, 0, this.posX, 0]);
	this.interpolatorY = new Interpolator([this.posY, 0, 0, this.posY, 0]);
	this.interpolationStart = Date.now();
};

Fish.prototype.Draw = function(ctx) {

	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());
	this.posX = dataX[0];
	this.posY = dataY[0];

	ctx.beginPath();
	ctx.arc(this.posX, this.posY, 10, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#20E020';
	ctx.fill();
	ctx.strokeStyle = '#ff0000';
	ctx.beginPath();
	ctx.moveTo(this.posX, this.posY);
	ctx.lineTo(this.posX + dataX[1] / 10, this.posY + dataY[1] / 10);
	ctx.stroke();
};

Fish.prototype.UpdatePosition = function(x, y) {

	var dataX = this.interpolatorX.Eval(this.InterpolationTime());
	var dataY = this.interpolatorY.Eval(this.InterpolationTime());

	this.interpolatorX = new Interpolator([dataX[0], dataX[1], -dataX[2]/2, x, 0]);
	this.interpolatorY = new Interpolator([dataY[0], dataY[1], -dataY[2]/2, y, 0]);
	this.interpolationStart = Date.now();
};

Fish.prototype.InterpolationTime = function() {
	var dt = Math.min(Math.max(Date.now() - this.interpolationStart, 0) / 1000, 1);
	return dt; //return 1 - (1 - dt)*(1 - dt); //return -2*dt*dt*dt + 3*dt*dt;
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