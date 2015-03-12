/* lib module

*/
var chalk = require('chalk');
var fs = require('fs');
var _ = require('underscore');
var io = require('socket.io');

// Serial port
var serialport = require("serialport").SerialPort;
// Neural Network
var brain = require('brain');
var net = new brain.NeuralNetwork();

// serial port parameters
var READ_CMD = [0x01,0x02,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x03];
var BAUD_RATE = 115200;
// imu parameters
var G_FACTOR = 0.00390625;
var GYRO_FACTOR = 14.375;
var ACC_X_OFFSET = 0;
var ACC_Y_OFFSET = 0;
var ACC_Z_OFFSET = 38.46;
var GYR_X_OFFSET = 0.626;
var GYR_Y_OFFSET = -1.895;
var GYR_Z_OFFSET = 0;
var COM_X_OFFSET = 38;
var COM_Y_OFFSET = 27.5;
var COM_Z_OFFSET = -25;
var COM_X_SCALE = 0.97;
var COM_Y_SCALE = 0.97;
var COM_Z_SCALE = 1.05;
var ALPHA = 0.9;
var BETA = 0.1;

// var com_x_max = com_y_max = com_z_max = 0;
// var com_x_min = com_y_min = com_z_min = 0;

var buffer = new Buffer(21);
var byteCounter =0;
// var isTracking = false;
var hand_data = "";
var imuBuffer = {};
var sampleCounter = 0;

var io = require('socket.io').listen(8001);

console.log("hello glove");




// var quaternion = require("./lib/Quaternion.js");
// var q = new quaternion(0.1,10);

var Recognizer = require("./GestureRecognizer.js");
var recognizer = new Recognizer();

/* init trained neural network */
var network = JSON.parse(fs.readFileSync('./trained_net.json','utf-8'));
net.fromJSON(network);

var sp = new serialport("/dev/cu.AmpedUp-AMP-SPP", {
// var sp = new serialport("/dev/tty.usbserial-DA00RAK6", {
  baudrate: BAUD_RATE,
});
//open serial port
sp.on("open", function () {
    console.log('Serial port is open');
    sp.write(READ_CMD);
});

sp.on('data',function(data){
  // console.log(data);
  // sp.write(READ_CMD);
      for(var i = 0;i<data.length;++i){
        buffer[byteCounter] = data[i]; 
        byteCounter++;
        // console.log(j);
      }
      if(byteCounter==21)
        sendData();
});
sp.on('error',function(error){
  console.log(chalk.red(error));
});


function sendData(){
      var acc_x,acc_y,acc_z,gyr_x,gyr_y,gyr_z,com_x,com_y,com_z;

      acc_x = (buffer.readInt16LE(2) + ACC_X_OFFSET)*G_FACTOR;
      acc_y = (buffer.readInt16LE(4) + ACC_Y_OFFSET)*G_FACTOR;
      acc_z = (buffer.readInt16LE(6) + ACC_Z_OFFSET)*G_FACTOR;
      gyr_x = buffer.readInt16LE(8)/GYRO_FACTOR - GYR_X_OFFSET;
      gyr_y = buffer.readInt16LE(10)/GYRO_FACTOR - GYR_Y_OFFSET;
      gyr_z = buffer.readInt16LE(12)/GYRO_FACTOR - GYR_Z_OFFSET;
      com_x = COM_X_SCALE * (buffer.readInt16LE(14) - COM_X_OFFSET);
      com_y = COM_Y_SCALE * (buffer.readInt16LE(16) - COM_Y_OFFSET);
      com_z = COM_Z_SCALE * (buffer.readInt16LE(18) - COM_Z_OFFSET);

      // com_x_max = Math.max(com_x_max,com_x);
      // com_x_min = Math.min(com_x_min,com_x);
      // com_y_max = Math.max(com_y_max,com_y);
      // com_y_min = Math.min(com_y_min,com_y);
      // com_z_max = Math.max(com_z_max,com_z);
      // com_z_min = Math.min(com_z_min,com_z);

      console.log(chalk.yellow(acc_x));

      // q.update(acc_x,acc_y,acc_z,degreesToRadians(gyr_x),degreesToRadians(gyr_y),degreesToRadians(gyr_z));
      // q.computeEuler();

      // var roll = q.getRoll();
      // var pitch = q.getPitch();
      var yaw = ALPHA * degreesToRadians(gyr_z) + BETA * degreesToRadians(com_z);
      // var yaw = q.getYaw();
      var roll = Math.atan(acc_y/Math.sqrt(acc_x*acc_x + acc_z*acc_z));
      var pitch = Math.atan(acc_x/Math.sqrt(acc_y*acc_y + acc_z*acc_z));
      // console.log(yaw);

      
      imuBuffer = [ acc_x.toFixed(2),
                    acc_y.toFixed(2),
                    acc_z.toFixed(2),
                    gyr_x.toFixed(2),
                    gyr_y.toFixed(2),
                    gyr_z.toFixed(2),
                    com_x.toFixed(2),
                    com_y.toFixed(2),
                    com_z.toFixed(2)
                    ];

      // send data to client
        sampleCounter++;


        //update queue with a new value
        var queueElement = [];
        for(var i = 0;i<recognizer.GESTURE_SAMPLES;++i){
          queueElement.push(Number(imuBuffer[i]));
        }
        recognizer.queue.push(queueElement);

        if(recognizer.queue.length == recognizer.GESTURE_SAMPLES+1)
          recognizer.queue.shift();

        var flattenQueue = _.flatten(recognizer.queue,true);

        var sample = [0.14,-1.36,0.15,61.57,-12.78,219.27,-8.73,442.81,-117.60,
              0.08,-0.86,0.10,-30.40,-2.90,-150.61,60.14,417.58,-140.70,
              -0.22,-1.48,0.23,-53.50,-10.56,-190.68,-350.17,358.41,-58.80,
              -0.27,-1.00,0.18,20.66,-8.12,84.80,-415.16,284.69,-48.30,
              0.06,-1.42,0.15,51.41,-10.07,242.37,-94.09,453.47,-96.60,
              0.10,-0.78,0.10,-23.03,-20.99,-102.54,68.87,419.52,-131.25];

        // console.log(sample.length);

        var sample2 = [-0.3,0.39,0.87,0.77,1.41,0.83,-0.33,0.37,0.86,0.7,
                        -0.61,-0.28,-0.34,0.39,0.86,-0.35,1.06,-2.78,-0.34,
                        0.38,0.87,-1.67,0.92,-0.42,-0.3,0.36,0.88,-0.97,0.36,
                        -1.74,-0.33,0.38,0.86,-0.97,2.8,-0.21];

        // detect new gesture from updated data
        var output = recognizer.run(net,flattenQueue);
          // console.log("circle is " + output.circle);
          // console.log("stop is " + output.stop);
          // console.log("walking is " + output.walking);
          // console.log("start mic is " + output.mic);

        for(var i=0;i<8;++i)
          hand_data += imuBuffer[i] + ',';
        hand_data += imuBuffer[8] + '\n';

        io.sockets.emit('data',{roll:roll,pitch:pitch,yaw:yaw,counter:sampleCounter,raw:imuBuffer,recognizer:output});
        if(sampleCounter == 60)
          sampleCounter = 0;
    // }
    buffer = new Buffer(21);
    byteCounter = 0;
    sp.write(READ_CMD);
}

function degreesToRadians(degree){
  return degree*(Math.PI/180);
}


io.sockets.on('connection', function (socket) {
  // start tracking
  socket.on('start',function (data) {
  hand_data = "";
  // isTracking = true;
  });
  socket.on('stop',function(data) {
    onStop(data.gesture);
  });
});


/* onStop()
*/
function onStop(gesture){
    // isTracking = false;


    var gestureString = "";
    /* valid gestures:
    * 1. start mic
    * 2. stop
    * 3. walking 
    * 4. circle 
    */
    switch(gesture){
      case 0:
        gestureString = "GESTURE_NONE\n";
      break;
      case 1:
        gestureString = "GESTURE_START_MIC\n";
      break;
      case 2:
        gestureString = "GESTURE_STOP\n";
      break;
      case 3:
        gestureString = "GESTURE_WALKING\n";
      break;
      case 4:
        gestureString = "GESTURE_CIRCLE\n";
      break;
      case 5:
        gestureString = "GESTURE_STANDING\n";
      break;
    }

    var filepath = './training_set/' + gestureString.replace("\n","") + '.csv';
    var data = fs.readFileSync(filepath,'utf-8');


    data += gestureString + hand_data;
    

    // add current date to filename
    // var d = new Date();
    // var n = d.getTime();
    fs.writeFile(filepath, data, function (err) {
       if (err) console.log("Error: ", err);
      console.log('It\'s saved!');
    });

}
