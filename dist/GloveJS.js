
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
// var serialport = require("serialport");
// var SerialPort = serialport.SerialPort;
 
// // list serial ports:
// serialport.list(function (err, ports) {
//   ports.forEach(function(port) {
//     console.log(port.comName);
//   });
// });





var hands;
var get_intent;
Leap.loop(function(frame){

  frame.hands.forEach(function(hand, index) {
    console.log(chalk.green("Roll is " + hand.roll()));
    console.log(chalk.red("Pitch is " + hand.pitch()));
    console.log(chalk.yellow("Yaw is " + hand.yaw()));
    // console.log(chalk.green("Hand Direction - x:" + hand.direction[0] + " y:" + hand.direction[1] + " z:" + hand.direction[2]));
    // console.log(chalk.red("Palm Position - x:" + hand.palmPosition[0] + " y:" + hand.palmPosition[1] + " z:" + hand.palmPosition[2]));
    // console.log(chalk.yellow("Palm Normal - x:" + hand.palmNormal[0] + " y:" + hand.palmNormal[1] + " z:" + hand.palmNormal[2]));
  });
  
});


// app.listen(port);


app.get('/hello',function(req,response){

   wit.captureTextIntent("ONGDMADEHQ5VBMYHHKWWBZQDYWQ3N3UB", "move ahead", function (err, res) {
    if (err) console.log("Error: ", err);

      // UNCOMMENT for sending just the intent
      // get_intent = JSON.stringify(res.outcomes[0].intent, null, " ");
      get_intent = JSON.stringify(res,null," ");
      // var string = get_intent.outcomes;
      response.send(get_intent + " and Leap is " + hands);
    });
});

app.get('/',function(req,res){

   var content = "Hello World, yeah!";
   res.send(content);

});

io.sockets.on('connection', function (socket) {


});

