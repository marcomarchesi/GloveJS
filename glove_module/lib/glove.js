/* Glove.js
* by Marco Marchesi
*/
var chalk = require('chalk');
var fs = require('fs');
var _ = require('underscore');
var io = require('socket.io');

// Serial port
var serialport = require("serialport").SerialPort;


// serial port parameters
var BT_PORT = "/dev/cu.Glove-AMP-SPP";
var USB_PORT = "/dev/cu.usbserial-DA00RAK6";
var START_CMD = [0x01,0x02,0x01,0x03];
var STOP_CMD = [0x01,0x02,0x00,0x03];
var BAUD_RATE = 57600;

/* MAGNETOMETER CALIBRATION */
//  (Caruso M., "Applications of Magnetoresistive Sensor in Navigation Systems")
//  Xsf = 1054/1072 = 0.983 ~= 1 
//  Ysf = 1072/1054 = 1.017

//  Xoff = ((1072/2) - 511)* Xsf = 25 * 0.983 = 24.575
//  Yoff = ((1054/2) - 566)* Ysf = -39.663

var COM_X_OFFSET = 24.575;
var COM_Y_OFFSET = -39.663;
var COM_X_SCALE = 0.983;
var COM_Y_SCALE = 1.017;
/*************************/
var pitch = roll = yaw = 0;

var stepCount = 0;
var WALKING_THRESHOLD = 1.75;


var SAMPLE_DIM = 6; // just sample accelerometer and gyroscope
var DECIMAL_PRECISION = 4;

var mag_x_max = mag_y_max = mag_z_max = 0;
var mag_x_min = mag_y_min = mag_z_min = 0;

var buffer = new Buffer(4096);
var byteCounter =0;
// var isTracking = false;
var hand_data = "";
var imuBuffer = [];
var imuArray = [];
var outputArray = [];
var standard_deviation = [8,8,8,1000,1000,1000];
var sampleCounter = 0;

var io = require('socket.io').listen(8001);

console.log("Hello Glove!");

var quaternion = require('./IMUProcess.js');
var q = new quaternion();

var Utils = require("./Utils.js");
var utils = new Utils();


var opened_port = USB_PORT;

var sp = new serialport(opened_port, {
  baudrate: BAUD_RATE,
  rtscts: false,
  flowControl: false
});

    /* OPEN SERIAL PORT */
    /********************/
    sp.on("open", function () {
        console.log('Serial port ' + opened_port + ' is open');
        sp.write(START_CMD);
    });

    sp.on('data',function(data){ 
          for(var i = 0;i<data.length;++i){
            buffer[byteCounter] = data[i]; 
            byteCounter++;
          }
          if(byteCounter==55)
            sendData();

    });
    sp.on('error',function(error){
      console.log(chalk.red(error));
    });
  


function sendData(){

      var acc_x,acc_y,acc_z,gyr_x,gyr_y,gyr_z,mag_x,mag_y,mag_z,theta,rx,ry,rz;

      acc_x = buffer.readFloatLE(2);
      acc_y = buffer.readFloatLE(6);
      acc_z = buffer.readFloatLE(10);
      gyr_x = buffer.readFloatLE(14);
      gyr_y = buffer.readFloatLE(18);
      gyr_z = buffer.readFloatLE(22);
      mag_x = buffer.readFloatLE(26);
      mag_y = buffer.readFloatLE(30);
      mag_z = buffer.readFloatLE(34);
      theta = buffer.readFloatLE(38);
      rx = buffer.readFloatLE(42);
      ry = buffer.readFloatLE(46);
      rz = buffer.readFloatLE(50);

      q.update(theta,rx,ry,rz);



      console.log(chalk.yellow("acc_x " + acc_x.toFixed(2) + " acc_y " + acc_y.toFixed(2) + " acc_z " + acc_z.toFixed(2)));
      // console.log(chalk.yellow("gyr_x " + gyr_x.toFixed(2) + " gyr_y " + gyr_y.toFixed(2) + " gyr_z " + gyr_z.toFixed(2)));
      // console.log(chalk.yellow("mag_x " + mag_x.toFixed(2) + " mag_y " + mag_y.toFixed(2) + " mag_z " + mag_z.toFixed(2)));



      var length = Math.sqrt(acc_x * acc_x+ acc_y  * acc_y  +acc_z  * acc_z );
      if(length>=WALKING_THRESHOLD)
        stepCount = 1;
      else
        stepCount = 0;

      roll = q.getRoll();
      pitch = q.getPitch();
      yaw = q.getYaw();


      
      
      imuBuffer = [ acc_x.toFixed(DECIMAL_PRECISION),
                    acc_y.toFixed(DECIMAL_PRECISION),
                    acc_z.toFixed(DECIMAL_PRECISION),
                    gyr_x.toFixed(DECIMAL_PRECISION),
                    gyr_y.toFixed(DECIMAL_PRECISION),
                    gyr_z.toFixed(DECIMAL_PRECISION),
                    mag_x.toFixed(DECIMAL_PRECISION),
                    mag_y.toFixed(DECIMAL_PRECISION),
                    mag_z.toFixed(DECIMAL_PRECISION),
                    theta.toFixed(DECIMAL_PRECISION),
                    rx.toFixed(DECIMAL_PRECISION),
                    ry.toFixed(DECIMAL_PRECISION),
                    rz.toFixed(DECIMAL_PRECISION)
                    ];

      imuArray.push([acc_x.toFixed(DECIMAL_PRECISION),
                    acc_y.toFixed(DECIMAL_PRECISION),
                    acc_z.toFixed(DECIMAL_PRECISION),
                    gyr_x.toFixed(DECIMAL_PRECISION),
                    gyr_y.toFixed(DECIMAL_PRECISION),
                    gyr_z.toFixed(DECIMAL_PRECISION)
                    ]);

      // send data to client
      sampleCounter++;

      io.sockets.emit('data',{roll:roll,pitch:pitch,yaw:yaw,stepCount:stepCount,counter:sampleCounter,raw:imuBuffer});

      buffer = new Buffer(55);
      byteCounter = 0;

}

/* MATH FUNCTIONS */

function degreesToRadians(degree){
  return degree*(Math.PI/180);
}
function sign(value){
  if (value > 0)
    return 1;
  else
    return -1;
}



io.sockets.on('connection', function (socket) {
  // start tracking
  socket.on('start',function (data) {
    hand_data = "";
    imuArray = [];
    outputArray = [];
    sampleCounter = 0;
  });
  socket.on('stop',function(data) {
    onStop(data.gesture);
  });
});


/* onStop()
*/
function onStop(gesture){
    // isTracking = false;

        /* valid gestures:
    * 1. start mic
    * 2. square
    * 3. triangle
    * 4. circle 
    */

    var gestureCSV = "";
    var gestureString = "************TIME_SERIES************\n";
    gestureString += "ClassID: " + gesture + "\n";
    gestureString += "TimeSeriesLength: " + sampleCounter + "\n";
    gestureString += "TimeSeriesData: \n";
    var filepath = "";

    filepath = './training_set/TestData.txt';

    console.log("imuArray is " + imuArray.length);
    // console.log(imuArray);

    for(var j=0;j<SAMPLE_DIM;++j){
        var featureArray = [];
        for(var i =0; i<imuArray.length;++i){
          featureArray.push(Number(imuArray[i][j]));
        }
        // console.log("feature is " + featureArray.length);
        var normalizedArray = utils.normalize(featureArray);
        // console.log("normalized is " + normalizedArray.length);
        // outputArray.push(normalizedArray);
        /* WITHOUT NORMALIZATION */
        outputArray.push(featureArray);
        // console.log("output is " + outputArray.length);
    }

    


    for(var i = 0;i<imuArray.length;++i){
      for(var j=0;j<SAMPLE_DIM-1;++j){
            // console.log("imu is " + imuArray[i][j] + " and norm is " + outputArray[j][i] + " and " + i + "," + j);
            hand_data += outputArray[j][i] + '\t'; 
          }
          hand_data += outputArray[SAMPLE_DIM-1][i] + '\n';
    }
    
    // save txt format for GRT

    var data = fs.readFileSync(filepath,'utf-8');
    data += gestureString + hand_data;
    fs.writeFile(filepath, data, function (err) {
       if (err) console.log("Error: ", err);
      console.log('It\'s saved!');
    });

    // reset
    sampleCounter = 0;
    
}
