var clusterfck = require("clusterfck");
var brain = require('brain');
var _ = require('underscore');
var kmeans = new clusterfck.Kmeans();


/* define some constants */
var GESTURE_START_MIC = 1;
var GESTURE_STOP = 2;
var GESTURE_WALKING = 3;
var GESTURE_CIRCLE = 4;
var GESTURE_STATES = 27;


function GestureRecognizer(){
  
  this.test = 'Hello World!'; //just a test
  this.data = []; //raw data from the controller
  this.trainingSet = [];  //labeled set
}

/* load the data from csv file*/
GestureRecognizer.prototype.load = function(data){

  var lines = data.split('\n');
  for(var i = 0;i<lines.length-1;++i){
      var line = lines[i].split(',');
      var corrected_line = [];
      for(var j = 0;j<lines.length;++j){
        
        line[j] = Number(line[j]);
        if(!_.isNaN(line[j])){
          corrected_line.push(line[j]);
        }
      }
      this.data.push(corrected_line);
  }

  return this.data;
};

/* clustering data and return centroids*/
GestureRecognizer.prototype.cluster = function(K){

  var clusters = kmeans.cluster(this.data, K);

  return clusters;
};

/* cluster a new data */
GestureRecognizer.prototype.classify = function(value){

  var clusterIndex = kmeans.classify(value);

  console.log("new cluster index is " + clusterIndex);
};

/* create pairs data-gesture */

/* valid gestures:
* 1. start mic
* 2. stop
* 3. walking 
* 4. circle
*/
GestureRecognizer.prototype.set = function(data,gesture){

  this.trainingSet.push({input:data,
                         output:
                        {
                          start_mic:(gesture == GESTURE_START_MIC)?1:0,
                          stop:(gesture == GESTURE_STOP)?1:0,
                          walking:(gesture == GESTURE_WALKING)?1:0,
                          circle:(gesture == GESTURE_CIRCLE)?1:0
                        }
                      });
};

/* train the neural network */
GestureRecognizer.prototype.train = function(network,training_set){
  console.log("hello train!");
  network.train(training_set);
};

/* run the neural network for classification */
GestureRecognizer.prototype.run = function(network,value){

  return network.run(value);
}

module.exports = GestureRecognizer;