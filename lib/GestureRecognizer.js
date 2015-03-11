var clusterfck = require("clusterfck");
var brain = require('brain');
var _ = require('underscore');
var kmeans = new clusterfck.Kmeans();


function GestureRecognizer(){

  /* define some constants */
  this.GESTURE_START_MIC = 1;
  this.GESTURE_STOP = 2;
  this.GESTURE_WALKING = 3;
  this.GESTURE_CIRCLE = 4;
  this.GESTURE_STATES = 27;

  this.GESTURE_SAMPLES = 6; //number of arrays acquired by the controller
  this.TRAINING_SETS = 10;
  this.SAMPLE_DIM = 9;

  this.test = 'Hello World!'; //just a test
  this.data = []; //raw data from the controller
  this.trainingSet = [];  //labeled set

  this.queue = [];
}

/* load the data from csv file*/
GestureRecognizer.prototype.load = function(data){

  this.data = [];

  var regex = /GESTURE\_(\w*)\n/g;
  var gesture_id = regex.exec(data)[0]; //check the gesture trained
  data = data.replace(regex,"");

  var lines = data.split('\n');

  for(var i=0;i<this.TRAINING_SETS;++i){
    var set = [];
    for(var j=0;j<this.GESTURE_SAMPLES;++j){
      var line = lines[(i*6)+j].split(',');
      for(var k=0;k<this.SAMPLE_DIM;++k){
        set.push(Number(line[k]));
      }
    }
    this.data.push(set);
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

  return kmeans.classify(value);

};

/* create pairs data-gesture */

/* valid gestures:
* 1. start mic
* 2. stop
* 3. walking 
* 4. circle 
*/
GestureRecognizer.prototype.set = function(data,gesture){

  var self = this;

  _.each(data,function(set){

    self.trainingSet.push({input:set,
                         output:
                        {
                          mic:(gesture == self.GESTURE_START_MIC)?1:0,
                          stop:(gesture == self.GESTURE_STOP)?1:0,
                          walking:(gesture == self.GESTURE_WALKING)?1:0,
                          circle:(gesture == self.GESTURE_CIRCLE)?1:0
                        }
                      });
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