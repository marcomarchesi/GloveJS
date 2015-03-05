
var express = require('express');
var socket = require('socket.io');
var chalk = require('chalk');
var fs = require('fs');
var wit = require('node-wit');
var app = express();
var port = 8000;
var READ_CMD = [0x01,0x02,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x03];
var BAUD_RATE = 115200;
var G_FACTOR = 0.00390625;
var GYRO_FACTOR = 14.375;
var ACC_X_OFFSET = 0;
var ACC_Y_OFFSET = 0;
var ACC_Z_OFFSET = 38.46;
var ALPHA = 0.99;
var BETA = 0.01;
var buffer = new Buffer(21);
var byteCounter =0;
var isTracking = false;
var hand_data = [];
var past_buffer = {};
var data_string = "";
var sampleCounter = 0;
var io = require('socket.io').listen(app.listen(port));

var quaternion = require("./lib/Quaternion.js");
var q = new quaternion(0.1,10);

console.log("listening port " + port);

app.use(express.static(__dirname + '/public'));

// //Serial port
var serialport = require("serialport").SerialPort;

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
      gyr_x = buffer.readInt16LE(8)/GYRO_FACTOR;
      gyr_y = buffer.readInt16LE(10)/GYRO_FACTOR;
      gyr_z = buffer.readInt16LE(12)/GYRO_FACTOR;
      com_x = buffer.readInt16LE(14);
      com_y = buffer.readInt16LE(16);
      com_z = buffer.readInt16LE(18);

      // console.log(chalk.green("acc x is: " + (acc_x+ACC_X_OFFSET)*G_FACTOR));
      // console.log(gyr_x);
      q.update(acc_x+ACC_X_OFFSET,acc_y+ACC_Y_OFFSET,acc_z+ACC_Z_OFFSET,degreesToRadians(gyr_x),degreesToRadians(gyr_y),degreesToRadians(gyr_z));
      q.computeEuler();

      // var roll = q.getRoll();
      // var pitch = q.getPitch();
      var yaw = q.getYaw();
      var roll = Math.atan(acc_y/Math.sqrt(acc_x*acc_x + acc_z*acc_z));
      var pitch = Math.atan(acc_x/Math.sqrt(acc_y*acc_y + acc_z*acc_z));
      console.log(yaw);

      
      past_buffer = {
                    acc_x:acc_x,
                    acc_y:acc_y,
                    acc_z:acc_z,
                    gyr_x:gyr_x,
                    gyr_y:gyr_y,
                    gyr_z:gyr_z,
                    com_x:com_x,
                    com_y:com_y,
                    com_z:com_z
                    };
    // send data to client
        sampleCounter++;
        hand_data.push({roll:roll,pitch:pitch,yaw:yaw});
        io.sockets.emit('data',{roll:roll,pitch:pitch,yaw:yaw,counter:sampleCounter});
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

// get the intent with wit.ai
var get_intent;
// array of data
app.get('/', function(req, res) {


  res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
  // start tracking
 socket.on('start',function (data) {
  hand_data = [];
  data_string = "";
  isTracking = true;
  });
  socket.on('stop',onStop);
});

function onStop(){
    isTracking = false;
    hand_data.forEach(function(entry){
      data_string += entry.roll+ "," + entry.pitch + "\n";
    });
    // add current date to filename
    var d = new Date();
    var n = d.getTime();
    fs.writeFile('g' + n + '.csv', data_string, function (err) {
      if (err) throw err;
      console.log('It\'s saved!');
    });
}


