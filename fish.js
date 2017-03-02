Fish = function() {
	this.posX = 100;
	this.posY = 100;
	this.interpolator = new Interpolator([this.posX, this.posY, 0, 0], [this.posX, this.posY, 0, 0]);
	this.interpolationStart = Date.now();
};

Fish.prototype.Draw = function(ctx) {

	var timeDifference = Math.min(Math.max(Date.now() - this.interpolationStart, 0) / 1000, 1);
	var data = this.interpolator.Eval(timeDifference);
	this.posX = data[0];
	this.posY = data[1];

	ctx.beginPath();
	ctx.arc(this.posX, this.posY, 10, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#20E020';
	ctx.fill();
};

Fish.prototype.UpdatePosition = function(x, y) {

	var timeDifference = Math.min(Math.max(Date.now() - this.interpolationStart, 0) / 1000, 1);
	var data = this.interpolator.Eval(timeDifference);
	this.interpolator = new Interpolator(data, [x, y, 0, 0]);
	this.interpolationStart = Date.now();
};


// cubic interpolation for smooth movement

Interpolator = function(dataNow, dataGoal) {

	var invMat = [[2, -2, 1, 1], [-3, 3, -2, -1], [0, 0, 1, 0], [1, 0, 0, 0]];

	this.coefX = MatrixVectorMult(invMat, [dataNow[0], dataGoal[0], dataNow[2], dataGoal[2]]);
	this.coefY = MatrixVectorMult(invMat, [dataNow[1], dataGoal[1], dataNow[3], dataGoal[3]]);
};

Interpolator.prototype.Eval= function(t) {
	return [	this.coefX[0]*t*t*t + this.coefX[1]*t*t + this.coefX[2]*t + this.coefX[3], // positions
				this.coefY[0]*t*t*t + this.coefY[1]*t*t + this.coefY[2]*t + this.coefY[3],
				3*this.coefX[0]*t*t + 2*this.coefX[1]*t + this.coefX[2], // velocities
				3*this.coefY[0]*t*t + 2*this.coefY[1]*t + this.coefY[2]];
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