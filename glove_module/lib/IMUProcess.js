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

IMUProcess.prototype.update = function(ax,ay,az,gx,gy,gz,mx,my,mz) {

    var norm;
    var hx, hy, _2bx, _2bz, _8bx, _8bz;
    var s1, s2, s3, s4;
    var qDot1, qDot2, qDot3, qDot4;
    var excludeAccel;

    var _2q1mx, _2q1my, _2q1mz, _2q2mx, _4bx, _4bz, _2q1, _2q2, _2q3, _2q4;
    var q1q1, q1q2, q1q3, q1q4, q2q2, q2q3, q2q4, q3q3, q3q4, q4q4, _2q1q3, _2q3q4;

    _2q1 = 2.0 * this.q1;
    _2q2 = 2.0 * this.q2;
    _2q3 = 2.0 * this.q3;
    _2q4 = 2.0 * this.q4;
    _2q1q3 = 2.0 * this.q1 * this.q3;
    _2q3q4 = 2.0 * this.q3 * this.q4;
    q1q1 = this.q1 * this.q1;
    q1q2 = this.q1 * this.q2;
    q1q3 = this.q1 * this.q3;
    q1q4 = this.q1 * this.q4;
    q2q2 = this.q2 * this.q2;
    q2q3 = this.q2 * this.q3;
    q2q4 = this.q2 * this.q4;
    q3q3 = this.q3 * this.q3;
    q3q4 = this.q3 * this.q4;
    q4q4 = this.q4 * this.q4;


    excludeAccel = 0; //Only use gyros and magnetos for updating the filter

    // Normalise accelerometer measurement
    norm = Math.sqrt(ax * ax + ay * ay + az * az);
    if (norm > 0.3 && excludeAccel == 0){ //normal larger than the sensor noise floor during freefall
       norm = 1.0 / norm; 
       ax *= norm;
       ay *= norm;
       az *= norm;
    }
    else{
       ax = 0;
       ay = 0;
       az = 0;
    }

    // Normalise magnetometer measurement
    norm = Math.sqrt(mx * mx + my * my + mz * mz);
    if (norm > 0.0){
       norm = 1.0 / norm;
       mx *= norm;
       my *= norm;
       mz *= norm;
    }
    // else{
    //   break; //something is wrong with the magneto readouts
    // }

    // Reference direction of Earth's magnetic field
    _2q1mx = 2 * this.q1 * mx;
    _2q1my = 2 * this.q1 * my;
    _2q1mz = 2 * this.q1 * mz;
    _2q2mx = 2 * this.q2 * mx;

    hx = mx * q1q1 - _2q1my * this.q4 + _2q1mz * this.q3 + mx * q2q2 + _2q2 * my * this.q3 + _2q2 * mz * this.q4 - mx * q3q3 - mx * q4q4;
    hy = _2q1mx * this.q4 + my * q1q1 - _2q1mz * this.q2 + _2q2mx * this.q3 - my * q2q2 + my * q3q3 + _2q3 * mz * this.q4 - my * q4q4;
    _2bx = Math.sqrt(hx * hx + hy * hy);
    _2bz = -_2q1mx * this.q3 + _2q1my * this.q2 + mz * q1q1 + _2q2mx * this.q4 - mz * q2q2 + _2q3 * my * this.q4 - mz * q3q3 + mz * q4q4;
    _4bx = 2.0 * _2bx;
    _4bz = 2.0 * _2bz;
    _8bx = 2.0 * _4bx;
    _8bz = 2.0 * _4bz;

    // Gradient descent algorithm corrective step
    s1 = -_2q3 * (2.0 * q2q4 - _2q1q3 - ax) + _2q2 * (2.0 * q1q2 + _2q3q4 - ay) - _4bz * this.q3 * (_4bx * (0.5 - q3q3 - q4q4) + _4bz * (q2q4 - q1q3) - mx) + (-_4bx * this.q4 + _4bz * this.q2) * (_4bx * (q2q3 - q1q4) + _4bz * (q1q2 + q3q4) - my) + _4bx * this.q3 * (_4bx * (q1q3 + q2q4) + _4bz * (0.5 - q2q2 - q3q3) - mz);
    s2 = _2q4 * (2.0 * q2q4 - _2q1q3 - ax) + _2q1 * (2.0 * q1q2 + _2q3q4 - ay) - 4.0 * this.q2 * (1.0 - 2.0 * q2q2 - 2.0 * q3q3 - az) + _4bz * this.q4 * (_4bx * (0.5 - q3q3 - q4q4) + _4bz * (q2q4 - q1q3) - mx) + (_4bx * this.q3 + _4bz * this.q1) * (_4bx * (q2q3 - q1q4) + _4bz * (q1q2 + q3q4) - my) + (_4bx * this.q4 - _8bz * this.q2) * (_4bx * (q1q3 + q2q4) + _4bz * (0.5 - q2q2 - q3q3) - mz);
    s3 = -_2q1 * (2.0 * q2q4 - _2q1q3 - ax) + _2q4 * (2.0 * q1q2 + _2q3q4 - ay) - 4.0 * this.q3 * (1.0 - 2.0 * q2q2 - 2.0 * q3q3 - az) + (-_8bx * this.q3 - _4bz * this.q1) * (_4bx * (0.5 - q3q3 - q4q4) + _4bz * (q2q4 - q1q3) - mx) + (_4bx * this.q2 + _4bz * this.q4) * (_4bx * (q2q3 - q1q4) + _4bz * (q1q2 + q3q4) - my) + (_4bx * this.q1 - _8bz * this.q3) * (_4bx * (q1q3 + q2q4) + _4bz * (0.5 - q2q2 - q3q3) - mz);
    s4 = _2q2 * (2.0 * q2q4 - _2q1q3 - ax) + _2q3 * (2.0 * q1q2 + _2q3q4 - ay) + (-_8bx * this.q4 + _4bz * this.q2) * (_4bx * (0.5 - q3q3 - q4q4) + _4bz * (q2q4 - q1q3) - mx) + (-_4bx * this.q1 + _4bz * this.q3) * (_4bx * (q2q3 - q1q4) + _4bz * (q1q2 + q3q4) - my) + _4bx * this.q2 * (_4bx * (q1q3 + q2q4) + _4bz * (0.5 - q2q2 - q3q3) - mz);

    norm = Math.sqrt(s1 * s1 + s2 * s2 + s3 * s3 + s4 * s4);
    if (norm > 0.0){
       norm = 1.0 / norm;  //normalise gradient step
       s1 *= norm;
       s2 *= norm;
       s3 *= norm;
       s4 *= norm;
    }
    // else{
    //    break;
    // }

    // Compute rate of change of quaternion
    qDot1 = 0.5 * (-this.q2 * gx - this.q3 * gy - this.q4 * gz) - this.Beta * s1;
    qDot2 = 0.5 * (this.q1 * gx + this.q3 * gz - this.q4 * gy) - this.Beta * s2;
    qDot3 = 0.5 * (this.q1 * gy - this.q2 * gz + this.q4 * gx) - this.Beta * s3;
    qDot4 = 0.5 * (this.q1 * gz + this.q2 * gy - this.q3 * gx) - this.Beta * s4;

    // Integrate to yield quaternion
    this.q1 += qDot1 * this.SamplePeriod;
    this.q2 += qDot2 * this.SamplePeriod;
    this.q3 += qDot3 * this.SamplePeriod;
    this.q4 += qDot4 * this.SamplePeriod;

    norm = Math.sqrt(this.q1 * this.q1 + this.q2 * this.q2 + this.q3 * this.q3 + this.q4 * this.q4);
    if (norm > 0.0){
       norm = 1.0 / norm;  //normalise quaternion
       this.q1 = this.q1 * norm;
       this.q2 = this.q2 * norm;
       this.q3 = this.q3 * norm;
       this.q4 = this.q4 * norm;
    }

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