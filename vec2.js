function Vec2(x, y) {
  this.x = x != null ? x : 0;
  this.y = y != null ? y : 0;
}
 
Vec2.create = function(x, y) {
  return new Vec2(x, y);
};

Vec2.fromArray = function(a) {
  return new Vec2(a[0], a[1]);
}

Vec2.fromDirection = function(angle, dist) {
  return new Vec2().setDirection(angle, dist);
}

Vec2.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};

Vec2.prototype.setVec2 = function(v) {
  this.x = v.x;
  this.y = v.y;
  return this;
};

Vec2.prototype.setDirection = function(angle, dist) {
  dist = dist || 1;

  this.x = dist * Math.cos(angle);
  this.y = dist * Math.sin(angle);

  return this;
};

Vec2.prototype.rotate = function(angle) {
  var tx = Math.cos(angle) * this.x - Math.sin(angle) * this.y;
  var ty = Math.sin(angle) * this.x + Math.cos(angle) * this.y;
  this.x = tx;
  this.y = ty;

  return this;
};
 
Vec2.prototype.equals = function(v, tolerance) {
  if (tolerance == null) {
    tolerance = 0.0000001;
  }
  return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance);
};

Vec2.prototype.isZero = function() {
  return this.x == 0 && this.y == 0;
};

Vec2.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};
 
Vec2.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Vec2.prototype.addXY = function(x, y) {
  this.x += x;
  this.y += y;
  return this;
};

Vec2.prototype.subXY = function(x, y) {
  this.x -= x;
  this.y -= y;
  return this;
};

Vec2.prototype.scale = function(f) {
  this.x *= f;
  this.y *= f;
  return this;
};

Vec2.prototype.distance = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  return Math.sqrt(dx * dx + dy * dy);
};
 
Vec2.prototype.squareDistance = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  return dx * dx + dy * dy;
};

Vec2.prototype.copy = function(v) {
  this.x = v.x;
  this.y = v.y;
  return this;
};
 
Vec2.prototype.clone = function() {
  return new Vec2(this.x, this.y);
};

Vec2.prototype.dup = function() {
  return this.clone();
};

Vec2.prototype.dot = function(b) {
  return this.x * b.x + this.y * b.y;
};

Vec2.prototype.ortho = function() {
  return new Vec2(-this.y, this.x).normalize();
};

Vec2.prototype.asAdd = function(a, b) {
  this.x = a.x + b.x;
  this.y = a.y + b.y;
  return this;
};

Vec2.prototype.asSub = function(a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  return this;
};

Vec2.prototype.addScaled = function(a, s) {
  this.x += a.x * s;
  this.y += a.y * s;
  return this;
};

Vec2.prototype.direction = function() {
  return Math.atan2(this.y, this.x);
};

Vec2.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vec2.prototype.length2 = function() {
  return this.x * this.x + this.y * this.y;
};

Vec2.prototype.normalize = function() {
  var len = this.length();
  if (len > 0) {
    this.scale(1 / len);
  }
  return this;
};

Vec2.prototype.limit = function(s) {
  var len = this.length();

  if (len > s && len > 0) {
    this.scale(s / len);
  }

  return this;
};

Vec2.prototype.lerp = function(v, t) {
  this.x = this.x + (v.x - this.x) * t;
  this.y = this.y + (v.y - this.y) * t;
  return this;
}

Vec2.prototype.toString = function() {
  return "{" + Math.floor(this.x*1000)/1000 + ", " + Math.floor(this.y*1000)/1000 + "}";
};

Vec2.prototype.hash = function() {
  return 1 * this.x + 12 * this.y;
};