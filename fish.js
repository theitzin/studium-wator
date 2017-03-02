Fish = function() {
	this.posX = 100;
	this.posY = 100;
};

Fish.prototype.Draw = function(ctx) {

	ctx.beginPath();
	ctx.arc(this.posX, this.posY, 10, 0, 2 * Math.PI, false);
	ctx.fillStyle = '#20E020';
	ctx.fill();
};