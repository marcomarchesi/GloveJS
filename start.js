
var express = require('express');
var socket = require('socket.io');
var glove = require('./glove_module/index.js');
var app = express();

var port = 8000;
var io = require('socket.io').listen(app.listen(port));


console.log("listening port " + port);


/* render index.html
*/
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {

   res.sendfile(__dirname + '/public/index.html');

});
