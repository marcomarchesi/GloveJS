var clusterfck = require("clusterfck");
var brain = require('brain');
var kmeans = new clusterfck.Kmeans();
var net = brain.NeuralNetwork();

var test_data = [[23,45,6],[34,4,6],[4,35,2],[2,5,9],[3,25,89]];

function GestureRecognizer(){
  
  this.test = 'Hello World!'; //just a test
  this.data = []; //raw data from the controller
  this.set = [];  //labeled set

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
GestureRecognizer.prototype.set = function(data,gesture){

}

/* train the neural network */
GestureRecognizer.prototype.train = function(training_set){
  net.train(training_set);
};


module.exports = GestureRecognizer;