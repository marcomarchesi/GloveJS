
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
var ACC_X_OFFSET = 23;
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
// var SerialPort = serialport.SerialPort;

var sp = new serialport("/dev/cu.AmpedUp-AMP-SPP", {
// var sp = new serialport("/dev/cu.usbserial-DA00RAK6", {
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
  if(isTracking){
      // low-pass filter
      // acc_x = ALPHA * past_buffer.acc_x + BETA * buffer.readInt16LE(2);
      // acc_y = ALPHA * past_buffer.acc_y + BETA * buffer.readInt16LE(4);
      // acc_z = ALPHA * past_buffer.acc_z + BETA * buffer.readInt16LE(6);
      // gyr_x = ALPHA * past_buffer.gyr_x + BETA * buffer.readInt16LE(8)/GYRO_FACTOR;
      // gyr_y = ALPHA * past_buffer.gyr_y + BETA * buffer.readInt16LE(10)/GYRO_FACTOR;
      // gyr_z = ALPHA * past_buffer.gyr_z + BETA * buffer.readInt16LE(12)/GYRO_FACTOR;
      // com_x = ALPHA * past_buffer.com_x + BETA * buffer.readInt16LE(14);
      // com_y = ALPHA * past_buffer.com_y + BETA * buffer.readInt16LE(16);
      // com_z = ALPHA * past_buffer.com_z + BETA * buffer.readInt16LE(18);
      acc_x = buffer.readInt16LE(2);
      acc_y = buffer.readInt16LE(4);
      acc_z = buffer.readInt16LE(6);
      gyr_x = buffer.readInt16LE(8)/GYRO_FACTOR;
      gyr_y = buffer.readInt16LE(10)/GYRO_FACTOR;
      gyr_z = buffer.readInt16LE(12)/GYRO_FACTOR;
      com_x = buffer.readInt16LE(14);
      com_y = buffer.readInt16LE(16);
      com_z = buffer.readInt16LE(18);

  }else{
      acc_x = buffer.readInt16LE(2);
      acc_y = buffer.readInt16LE(4);
      acc_z = buffer.readInt16LE(6);
      gyr_x = buffer.readInt16LE(8)/GYRO_FACTOR;
      gyr_y = buffer.readInt16LE(10)/GYRO_FACTOR;
      gyr_z = buffer.readInt16LE(12)/GYRO_FACTOR;
      com_x = buffer.readInt16LE(14);
      com_y = buffer.readInt16LE(16);
      com_z = buffer.readInt16LE(18);

      isTracking = true;
  }
      console.log(chalk.green("acc y is: " + (acc_y+ACC_Y_OFFSET)*G_FACTOR));
      // console.log(gyr_x);
      q.update(acc_x+ACC_X_OFFSET,acc_y+ACC_Y_OFFSET,acc_z+ACC_Z_OFFSET,degreesToRadians(gyr_x),degreesToRadians(gyr_y),degreesToRadians(gyr_z));
      q.computeEuler();


      // var comp_norm = Math.sqrt((comp_x*comp_x)+(comp_y*comp_y)+(comp_z*comp_z));
      // comp_x /= comp_norm;
      // comp_y /= comp_norm;
      // comp_z /= comp_norm;
      var pitch = (Math.atan2(acc_x,Math.sqrt(acc_y*acc_y+acc_z*acc_z)) * 180.0) / Math.PI;

      var roll = (Math.atan2(acc_y,(Math.sqrt(acc_x*acc_x+acc_z*acc_z))) * 180.0) / Math.PI;
      // var roll = q.getRoll();
      // var pitch = q.getPitch();
      // var yaw = q.getYaw();
      var yaw = (Math.atan2( (-com_y*Math.cos(roll) + com_z*Math.sin(roll) ) , (com_x*Math.cos(pitch) + com_y*Math.sin(pitch)*Math.sin(roll)+ com_z*Math.sin(pitch)*Math.cos(roll)))* 180.0) / Math.PI;
      past_buffer = {
                    acc_x:acc_x,
                    acc_y:acc_y,
                    acc_z:acc_z,
                    // acc_x_g:buffer.readInt16LE(2)*G_FACTOR,
                    // acc_y_g:buffer.readInt16LE(4)*G_FACTOR,
                    // acc_z_g:buffer.readInt16LE(6)*G_FACTOR,
                    gyr_x:gyr_x,
                    gyr_y:gyr_y,
                    gyr_z:gyr_z,
                    com_x:com_x,
                    com_y:com_y,
                    com_z:com_z
                    };
    // send data to client
    // if(isTracking){
        sampleCounter++;
        hand_data.push({roll:roll,pitch:pitch});
        io.sockets.emit('data',{roll:roll,pitch:pitch,yaw:yaw,counter:sampleCounter});
        if(sampleCounter == 60)
          sampleCounter = 0;
    // }
    // console.log(past_buffer);
    // past_buffer = {};
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

  wit.captureTextIntent("ONGDMADEHQ5VBMYHHKWWBZQDYWQ3N3UB", "move ahead", function (err, res) {
    if (err) console.log("Error: ", err);
      // UNCOMMENT for sending just the intent
      // get_intent = JSON.stringify(res.outcomes[0].intent, null, " ");
      get_intent = JSON.stringify(res,null," ");
      // var string = get_intent.outcomes;
      io.sockets.emit('hand',{intent:get_intent});
      // response.send(get_intent + " and Leap is " + hands);
    });
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


