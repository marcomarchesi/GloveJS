
var express = require('express');
var socket = require('socket.io');
var chalk = require('chalk');
var fs = require('fs');
var _ = require('underscore');
var wit = require('node-wit');
var app = express();
// Serial port
var serialport = require("serialport").SerialPort;
var port = 8000;

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
var io = require('socket.io').listen(app.listen(port));

var quaternion = require("./lib/Quaternion.js");
var Recognizer = require("./lib/GestureRecognizer.js");

var q = new quaternion(0.1,10);
var recognizer = new Recognizer();

console.log("listening port " + port);


/* render index.html
*/
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {

   res.sendfile(__dirname + '/public/index.html');

});



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
      // console.log(chalk.red(byteCounter))
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

      console.log(chalk.yellow(com_y));

      q.update(acc_x,acc_y,acc_z,degreesToRadians(gyr_x),degreesToRadians(gyr_y),degreesToRadians(gyr_z));
      q.computeEuler();

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
        recognizer.queue.push(_.first(imuBuffer, 6));
        if(recognizer.queue.length == 6)
          recognizer.queue.shift();


        for(var i=0;i<8;++i)
          hand_data += imuBuffer[i] + ',';
        hand_data += imuBuffer[8] + '\n';

        io.sockets.emit('data',{roll:roll,pitch:pitch,yaw:yaw,counter:sampleCounter,raw:imuBuffer});
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
  hand_data = [];
  // isTracking = true;
  });
  socket.on('stop',onStop);
});


/* onStop()
*/
function onStop(){
    // isTracking = false;

    console.log(hand_data);

    // add current date to filename
    var d = new Date();
    var n = d.getTime();
    fs.writeFile('g' + n + '.csv', hand_data, function (err) {
       if (err) console.log("Error: ", err);
      console.log('It\'s saved!');
    });

    // send data to the recognizer
    // recognizer.load(hand_data);
    // recognizer.cluster();
}


