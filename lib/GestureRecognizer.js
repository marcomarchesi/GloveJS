var clusterfck = require("clusterfck");
var brain = require('brain');
var kmeans = new clusterfck.Kmeans();

var test_data = [[23,45,6],[34,4,6],[4,35,2],[2,5,9],[3,25,89]];

function GestureRecognizer(){
  
  this.test = 'Hello World!'; //just a test
  this.data = []; //raw data from the controller
  this.trainingSet = [];  //labeled set

  this.GESTURE_START_MIC = 1;
  this.GESTURE_STOP = 2;
  this.GESTURE_WALKING = 3;
  this.GESTURE_CIRCLE = 4;

}

/* load the data */
GestureRecognizer.prototype.load = function(data){

  this.data = data;
  return this.data;
};

/* clustering data and return centroids*/
GestureRecognizer.prototype.cluster = function(K){

  var clusters = kmeans.cluster(this.data, K);
  return kmeans.centroids;
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
                          start_mic:(gesture == this.GESTURE_START_MIC)?1:0,
                          stop:(gesture == this.GESTURE_STOP)?1:0,
                          walking:(gesture == this.GESTURE_WALKING)?1:0,
                          circle:(gesture == this.GESTURE_CIRCLE)?1:0
                        }
                      });
};

/* train the neural network */
GestureRecognizer.prototype.train = function(network,training_set){
  console.log("hello train!");
  network.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);
};


module.exports = GestureRecognizer;