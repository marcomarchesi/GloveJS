function IMUProcess(){

  this.SamplePeriod = 0.03;
  this.Beta = 0.01;
  this.q1 = 1;
  this.q2 = 0;
  this.q3 = 0;
  this.q4 = 0;
  this.roll = 0;
  this.pitch = 0;
  this.yaw = 0;
}

IMUProcess.prototype.update = function(theta,rx,ry,rz) {

    this.q1 = rx * Math.sin(theta/2);
    this.q2 = ry * Math.sin(theta/2);
    this.q3 = rz * Math.sin(theta/2);
    this.q4 = Math.cos(theta/2);


};

IMUProcess.prototype.getRoll = function(){
  this.roll = Math.atan2(2*(this.q1 * this.q2 + this.q3 * this.q4),1 - 2 * (this.q2 * this.q2 + this.q3 * this.q3));
  return this.roll;
};

IMUProcess.prototype.getPitch = function(){
  this.pitch = Math.asin(2*(this.q1 * this.q3 - this.q4 * this.q2));
  return this.pitch;
};

IMUProcess.prototype.getYaw = function(){
  this.yaw = Math.atan2(2*(this.q1 * this.q4 + this.q2 * this.q3),1 - 2 * (this.q3 * this.q3 + this.q4 * this.q4));
  return this.yaw;
};

module.exports = IMUProcess;