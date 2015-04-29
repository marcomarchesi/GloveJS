/* Glove.js
* by Marco Marchesi
*/
var chalk = require('chalk');
var fs = require('fs');
var _ = require('underscore');
var io = require('socket.io');

// Serial port
var serialport = require("serialport").SerialPort;

/* OSC port */
var osc = require('node-osc');
var oscClient = new osc.Client('127.0.0.1', 5000);


// UNCOMMENT FOR Neural Network
// var brain = require('brain');
// var net = new brain.NeuralNetwork();

// UNCOMMENT FOR Leap Motion
// var Leap = require('leapjs');
// var controller = new Leap.Controller({enableGestures: false});
// var leapHand = {};


// serial port parameters
var BT_PORT = "/dev/cu.AmpedUp-AMP-SPP";
var USB_PORT = "/dev/tty.usbserial-DA00RAK6";
var START_CMD = [0x01,0x02,0x01,0x03];
var STOP_CMD = [0x01,0x02,0x00,0x03];
var BAUD_RATE = 115200;
// imu parameters
var G_FACTOR = 0.00390625;
var GYRO_FACTOR = 14.375;
var ACC_X_OFFSET = -17.948;
var ACC_Y_OFFSET = -12.820;
var ACC_Z_OFFSET = 38.46;
var GYR_X_OFFSET = -0.63;
var GYR_Y_OFFSET = 1.81;
var GYR_Z_OFFSET = 0.07;
var SAMPLE_TIME = 0.03 // 30 milliseconds

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

var ALPHA = 0.97; //from ALPHA = t / (SAMPLE_TIME * t) and t = 1 (initial guess)

var SAMPLE_DIM = 6; // just sample accelerometer and gyroscope
var DECIMAL_PRECISION = 4;

var com_x_max = com_y_max = com_z_max = 0;
var com_x_min = com_y_min = com_z_min = 0;

var buffer = new Buffer(21);
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

// var Recognizer = require("./GestureRecognizer.js");
// var recognizer = new Recognizer();

// /* init trained neural network */
// var network = JSON.parse(fs.readFileSync('./trained_net.json','utf-8'));
// net.fromJSON(network);

var opened_port = BT_PORT;

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
          if(byteCounter==21)
            sendData();

    });
    sp.on('error',function(error){
      console.log(chalk.red(error));
    });
  
    /* uncomment for LEAP MOTION usage */
    // controller.loop(function(frame) {

    //         for (var i in frame.handsMap) {
    //           leapHand = frame.handsMap[i];
    //           // console.log(leapHand.roll());
    //           io.sockets.emit('data',{roll:leapHand.roll(),pitch:leapHand.pitch(),yaw:leapHand.yaw()});
    //         }
            
    // });
    // controller.on('ready', function() {
    //       console.log(chalk.green("Leap Motion ready"));
    // });

    /* *********************** */


function sendData(){

      var acc_x,acc_y,acc_z,gyr_x,gyr_y,gyr_z,com_x,com_y,com_z;

      acc_x = (buffer.readInt16LE(2) + ACC_X_OFFSET)*G_FACTOR;
      acc_y = (buffer.readInt16LE(4) + ACC_Y_OFFSET)*G_FACTOR;
      acc_z = (buffer.readInt16LE(6) + ACC_Z_OFFSET)*G_FACTOR;
      gyr_x = buffer.readInt16LE(8)/GYRO_FACTOR + GYR_X_OFFSET;
      gyr_y = buffer.readInt16LE(10)/GYRO_FACTOR + GYR_Y_OFFSET;
      gyr_z = buffer.readInt16LE(12)/GYRO_FACTOR + GYR_Z_OFFSET;
      com_x = COM_X_SCALE * buffer.readInt16LE(14) + COM_X_OFFSET;
      com_y = COM_Y_SCALE * buffer.readInt16LE(16) + COM_Y_OFFSET;
      com_z = buffer.readInt16LE(18);

      q.update(acc_x,acc_y,acc_z,gyr_x,gyr_y,gyr_z,com_x,com_y,com_z);


      /* VALUES FOR COMPASS CALIBRATION */
      // com_x_max = Math.max(com_x_max,com_x);
      // com_x_min = Math.min(com_x_min,com_x);
      // com_y_max = Math.max(com_y_max,com_y);
      // com_y_min = Math.min(com_y_min,com_y);
      // com_z_max = Math.max(com_z_max,com_z);
      // com_z_min = Math.min(com_z_min,com_z);

      // console.log(chalk.yellow("acc_x " + acc_x.toFixed(2) + " acc_y " + acc_y.toFixed(2) + " acc_z " + acc_z.toFixed(2)));
      // console.log(chalk.yellow("gyr_x " + gyr_x.toFixed(2) + " gyr_y " + gyr_y.toFixed(2) + " gyr_z " + gyr_z.toFixed(2)));
      // console.log(chalk.yellow("com_x " + com_x.toFixed(2) + " com_y " + com_y.toFixed(2) + " com_z " + com_z.toFixed(2)));

      // console.log('max is ' + com_y_max + " min is " + com_y_min);
      //max_x = 511
      //min_x = -561
      //max_y = 566
      //min_y -488

      //Xsf = 1054/1072 = 0.983 = 1
      //Ysf = 1072/1054 = 1.017

      //Xoff = ((1072/2) - 511)* Xsf = 25 * 0.983 = 24.575
      //Yoff = ((1054/2) - 566)* Ysf = -39.663


      var length = Math.sqrt(acc_x * acc_x+ acc_y  * acc_y  +acc_z  * acc_z );
      if(length>=WALKING_THRESHOLD)
        stepCount = 1;
      else
        stepCount = 0;


      /* COMPLEMENTARY FILTER */
      /* it works with the accelerometer and the gyroscope */
      //IMU is rotated of -Math.PI/2 so I swap x & y in the formulas below:

      /* ROLL */
      var roll_short = Math.atan2(acc_x,Math.sqrt(acc_y*acc_y + acc_z*acc_z));
      roll = ALPHA * (roll - (degreesToRadians(gyr_y) * SAMPLE_TIME)) + (1- ALPHA) * roll_short;
      /* PITCH */
      var pitch_short  = Math.atan2(acc_y,acc_z);
      pitch  = ALPHA * (pitch + (degreesToRadians(gyr_x) * SAMPLE_TIME)) + (1- ALPHA) * pitch_short;
      // // var yaw_short = degreesToRadians(com_y);
      // // yaw = ALPHA * (yaw + (degreesToRadians(gyr_z) * SAMPLE_TIME)) + (1- ALPHA) * yaw_short;
      // var yaw_compensation = sign(yaw)*degreesToRadians(SAMPLE_TIME*0.144);
      // yaw = yaw + (degreesToRadians(gyr_z) * SAMPLE_TIME) + yaw_compensation;
      // roll = q.getRoll();
      // pitch = q.getPitch();
      yaw = q.getYaw();


      
      
      imuBuffer = [ acc_x.toFixed(DECIMAL_PRECISION),
                    acc_y.toFixed(DECIMAL_PRECISION),
                    acc_z.toFixed(DECIMAL_PRECISION),
                    gyr_x.toFixed(DECIMAL_PRECISION),
                    gyr_y.toFixed(DECIMAL_PRECISION),
                    gyr_z.toFixed(DECIMAL_PRECISION),
                    com_x.toFixed(DECIMAL_PRECISION),
                    com_y.toFixed(DECIMAL_PRECISION),
                    com_z.toFixed(DECIMAL_PRECISION)
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

      buffer = new Buffer(21);
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
        var normalizedArray = utils.normalize(featureArray,0,standard_deviation[j]);
        // console.log("normalized is " + normalizedArray.length);
        outputArray.push(normalizedArray);
        // console.log("output is " + outputArray.length);
    }

    


    for(var i = 0;i<imuArray.length;++i){
      for(var j=0;j<SAMPLE_DIM-1;++j){
            // console.log("imu is " + imuArray[i][j] + " and norm is " + outputArray[j][i] + " and " + i + "," + j);
            hand_data += outputArray[j][i] + '\t'; 
          }
          hand_data += outputArray[SAMPLE_DIM-1][i] + '\n';
    }

    // console.log(hand_data);
    
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
