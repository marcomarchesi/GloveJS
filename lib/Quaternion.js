function Quaternion(rate,gyroscopeMeasurementError){

  this.firstUpdate = 0;
  //Quaternion orientation of earth frame relative to auxiliary frame.
    this.AEq_1 = 1;
    this.AEq_2 = 0;
    this.AEq_3 = 0;
    this.AEq_4 = 0;
    
    //Estimated orientation quaternion elements with initial conditions.
    this.SEq_1 = 1;
    this.SEq_2 = 0;
    this.SEq_3 = 0;
    this.SEq_4 = 0;
  this.deltat = rate;
  //Gyroscope measurement error (in degrees per second).
  this.gyroMeasError = gyroscopeMeasurementError;
  //Compute beta.
  this.beta = Math.sqrt(3.0 / 4.0) * (Math.PI * (this.gyroMeasError / 180.0)); 
  // this.beta = Math.sqrt(3.0 / 4.0);

  this.roll = 0;
  this.pitch = 0;
  this.yaw = 0;

}

Quaternion.prototype.test = function(){
  return 'Hello World of Quaternions!';
};

Quaternion.prototype.update = function(a_x,a_y,a_z,w_x,w_y,w_z){
  //Local system variables.
 
    //Vector norm.
    var norm;
    //Quaternion rate from gyroscope elements.
    var SEqDot_omega_1;
    var SEqDot_omega_2;
    var SEqDot_omega_3;
    var SEqDot_omega_4;
    //Objective function elements.
    var f_1;
    var f_2;
    var f_3;
    //Objective function Jacobian elements.
    var J_11or24;
    var J_12or23;
    var J_13or22;
    var J_14or21;
    var J_32;
    var J_33;
    //Objective function gradient elements.
    var nablaf_1;
    var nablaf_2;
    var nablaf_3;
    var nablaf_4;
 
    //Auxiliary variables to avoid reapeated calcualtions.
    var halfSEq_1 = 0.5 * this.SEq_1;
    var halfSEq_2 = 0.5 * this.SEq_2;
    var halfSEq_3 = 0.5 * this.SEq_3;
    var halfSEq_4 = 0.5 * this.SEq_4;
    var twoSEq_1 = 2.0 * this.SEq_1;
    var twoSEq_2 = 2.0 * this.SEq_2;
    var twoSEq_3 = 2.0 * this.SEq_3;
 
    //Compute the quaternion rate measured by gyroscopes.
    SEqDot_omega_1 = -halfSEq_2 * w_x - halfSEq_3 * w_y - halfSEq_4 * w_z;
    SEqDot_omega_2 = halfSEq_1 * w_x + halfSEq_3 * w_z - halfSEq_4 * w_y;
    SEqDot_omega_3 = halfSEq_1 * w_y - halfSEq_2 * w_z + halfSEq_4 * w_x;
    SEqDot_omega_4 = halfSEq_1 * w_z + halfSEq_2 * w_y - halfSEq_3 * w_x;
 
    //Normalise the accelerometer measurement.
    norm = Math.sqrt(a_x * a_x + a_y * a_y + a_z * a_z);
    a_x /= norm;
    a_y /= norm;
    a_z /= norm;
 
    //Compute the objective function and Jacobian.
    f_1 = twoSEq_2 * this.SEq_4 - twoSEq_1 * this.SEq_3 - a_x;
    f_2 = twoSEq_1 * this.SEq_2 + twoSEq_3 * this.SEq_4 - a_y;
    f_3 = 1.0 - twoSEq_2 * this.SEq_2 - twoSEq_3 * this.SEq_3 - a_z;
    //J_11 negated in matrix multiplication.
    J_11or24 = twoSEq_3;
    J_12or23 = 2 * this.SEq_4;
    //J_12 negated in matrix multiplication
    J_13or22 = twoSEq_1;
    J_14or21 = twoSEq_2;
    //Negated in matrix multiplication.
    J_32 = 2 * J_14or21;
    //Negated in matrix multiplication.
    J_33 = 2 * J_11or24;
 
    //Compute the gradient (matrix multiplication).
    nablaf_1 = J_14or21 * f_2 - J_11or24 * f_1;
    nablaf_2 = J_12or23 * f_1 + J_13or22 * f_2 - J_32 * f_3;
    nablaf_3 = J_12or23 * f_2 - J_33 * f_3 - J_13or22 * f_1;
    nablaf_4 = J_14or21 * f_1 + J_11or24 * f_2;
 
    //Normalise the gradient.
    norm = Math.sqrt(nablaf_1 * nablaf_1 + nablaf_2 * nablaf_2 + nablaf_3 * nablaf_3 + nablaf_4 * nablaf_4);
    nablaf_1 /= norm;
    nablaf_2 /= norm;
    nablaf_3 /= norm;
    nablaf_4 /= norm;
 
    //Compute then integrate the estimated quaternion rate.
    this.SEq_1 += (SEqDot_omega_1 - (this.beta * nablaf_1)) * this.deltat;
    this.SEq_2 += (SEqDot_omega_2 - (this.beta * nablaf_2)) * this.deltat;
    this.SEq_3 += (SEqDot_omega_3 - (this.beta * nablaf_3)) * this.deltat;
    this.SEq_4 += (SEqDot_omega_4 - (this.beta * nablaf_4)) * this.deltat;
 
    //Normalise quaternion
    norm = Math.sqrt(this.SEq_1 * this.SEq_1 + this.SEq_2 * this.SEq_2 + this.SEq_3 * this.SEq_3 + this.SEq_4 * this.SEq_4);
    this.SEq_1 /= norm;
    this.SEq_2 /= norm;
    this.SEq_3 /= norm;
    this.SEq_4 /= norm;
 
    if (this.firstUpdate == 0) {
        //Store orientation of auxiliary frame.
        this.AEq_1 = this.SEq_1;
        this.AEq_2 = this.SEq_2;
        this.AEq_3 = this.SEq_3;
        this.AEq_4 = this.SEq_4;
        this.firstUpdate = 1;
    }

    
};

Quaternion.prototype.computeEuler = function(){
   //Quaternion describing orientation of sensor relative to earth.
    var ESq_1, ESq_2, ESq_3, ESq_4;
    //Quaternion describing orientation of sensor relative to auxiliary frame.
    var ASq_1, ASq_2, ASq_3, ASq_4;    
                              
    //Compute the quaternion conjugate.
    ESq_1 = this.SEq_1;
    ESq_2 = -this.SEq_2;
    ESq_3 = -this.SEq_3;
    ESq_4 = -this.SEq_4;
 
    //Compute the quaternion product.
    ASq_1 = ESq_1 * this.AEq_1 - ESq_2 * this.AEq_2 - ESq_3 * this.AEq_3 - ESq_4 * this.AEq_4;
    ASq_2 = ESq_1 * this.AEq_2 + ESq_2 * this.AEq_1 + ESq_3 * this.AEq_4 - ESq_4 * this.AEq_3;
    ASq_3 = ESq_1 * this.AEq_3 - ESq_2 * this.AEq_4 + ESq_3 * this.AEq_1 + ESq_4 * this.AEq_2;
    ASq_4 = ESq_1 * this.AEq_4 + ESq_2 * this.AEq_3 - ESq_3 * this.AEq_2 + ESq_4 * this.AEq_1;
 
    //Compute the Euler angles from the quaternion.
    this.roll = Math.atan2(2 * ASq_3 * ASq_4 - 2 * ASq_1 * ASq_2, 2 * ASq_1 * ASq_1 + 2 * ASq_4 * ASq_4 - 1);
    this.pitch = Math.asin(2 * ASq_2 * ASq_3 - 2 * ASq_1 * ASq_3);
    this.yaw = Math.atan2(2 * ASq_2 * ASq_3 - 2 * ASq_1 * ASq_4, 2 * ASq_1 * ASq_1 + 2 * ASq_2 * ASq_2 - 1);
}

Quaternion.prototype.getRoll = function(){
  return this.roll;
}
Quaternion.prototype.getPitch = function(){
  return this.pitch;
}
Quaternion.prototype.getYaw = function(){
  return this.yaw;
}

module.exports = Quaternion;
