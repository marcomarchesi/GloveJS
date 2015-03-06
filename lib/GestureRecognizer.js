var clusterfck = require("clusterfck");
var kmeans = new clusterfck.Kmeans();

var test_data = [[23,45,6],[34,4,6],[4,35,2],[2,5,9],[3,25,89]];

function GestureRecognizer(){
  
  this.test = 'Hello World!';
  this.data = [];

}

// Initialize data
GestureRecognizer.prototype.init = function(){

};

//load data to be processed
GestureRecognizer.prototype.load = function(data){

  this.data = data;
  return this.data;
};

//
GestureRecognizer.prototype.cluster = function(K){

  var clusters = kmeans.cluster(this.data, K);

  return kmeans.centroids;
};


module.exports = GestureRecognizer;