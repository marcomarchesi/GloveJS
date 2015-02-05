
var express = require('express');
var socket = require('socket.io');
var chalk = require('chalk');
var fs = require('fs');
var Leap = require('leapjs');
var wit = require('node-wit');
var app = express();
var port = 8000;

var io = require('socket.io').listen(app.listen(port));
console.log("listening port " + port);

app.use(express.static(__dirname + '/public'));
// var serialport = require("serialport");
// var SerialPort = serialport.SerialPort;
 
// // list serial ports:
// serialport.list(function (err, ports) {
//   ports.forEach(function(port) {
//     console.log(port.comName);
//   });
// });

// instance LeapJS
var controller = Leap.loop({enableGestures:false}, function(frame){
                         });
// get the intent with wit.ai
var get_intent;
// array of data
var hand_data = [];
// app.listen(port);
app.get('/', function(req, res) {

  res.sendfile(__dirname + '/public/index.html');

  wit.captureTextIntent("ONGDMADEHQ5VBMYHHKWWBZQDYWQ3N3UB", "move ahead", function (err, res) {
    if (err) console.log("Error: ", err);

      console.log("Hello there!");

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
  controller.connect();
  controller.on('frame',function(frame){
    var hand = frame.hands[0];
    if(hand){
        hand_data.push({roll:hand.roll(),pitch:hand.pitch(),yaw:hand.yaw()});
        socket.emit('data',{roll:hand.roll(),pitch:hand.pitch(),yaw:hand.yaw()});
      }
    });
  });
  // stop tracking
  // controller.on('streamingStopped', onServiceStopped);
  socket.on('stop',onServiceStopped);
});

function onServiceStopped(){
  controller.disconnect();
    // roll,pitch and yaw as data
    var data_string = "ROLL,PITCH,YAW\n";
    hand_data.forEach(function(entry){
      data_string += entry.roll + "," + entry.pitch + "," + entry.yaw + "\n";
    });
    // add current date to filename
    var d = new Date();
    var n = d.getTime();
    fs.writeFile('g' + n + '.csv', data_string, function (err) {
      if (err) throw err;
      console.log('It\'s saved!');
    });
}

