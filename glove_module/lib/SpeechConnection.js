/* SpeechConnection.js

*/
var wit = require('node-wit');

function SpeechConnection(){

    // get the intent with wit.ai
   this.get_intent;
   // var startTime = new Date();
   wit.captureTextIntent("ONGDMADEHQ5VBMYHHKWWBZQDYWQ3N3UB", "move ahead", function (err, res) {
    if (err) console.log("Error: ", err);
      // UNCOMMENT for sending just the intent
      // get_intent = JSON.stringify(res.outcomes[0].intent, null, " ");
      // var endTime = new Date();
      // console.log(endTime - startTime); //difference in milliseconds
      this.get_intent = JSON.stringify(res,null," ");
    
      // var string = get_intent.outcomes;
      console.log("the intent is " + this.get_intent);
      io.sockets.emit('hand',{intent:this.get_intent});
      // response.send(get_intent + " and Leap is " + hands);
    });
}

module.exports = SpeechConnection;