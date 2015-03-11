/* unit tests for GestureRecognizer.js
*/

var assert = require("assert");
var gestureRecognizer = require("../lib/GestureRecognizer.js");
var fs = require('fs');
// var recognizer = new gestureRecognizer();
var brain = require('brain');
var net = new brain.NeuralNetwork();

describe('GestureRecognizer', function(){

  describe('load', function(){
    it('should return the data loaded', function(){
      var recognizer = new gestureRecognizer();
      var test_data = fs.readFileSync('./g1425979269384.csv','utf-8');
      assert.equal(10, recognizer.load(test_data).length);
    });
  });

  describe('cluster',function(){
    it('should return the clusters', function(){
      var recognizer = new gestureRecognizer();
      var test_data = fs.readFileSync('./g1425979269384.csv','utf-8');
      recognizer.load(test_data);
      assert.equal(2, recognizer.cluster(2).length);
    });
  });

  describe('classify',function(){
    it('should cluster a new value from the glove',function(){
      var recognizer = new gestureRecognizer();
      var test_data = fs.readFileSync('./g1425979269384.csv','utf-8');
      recognizer.load(test_data);
      recognizer.cluster(2);
      console.log(recognizer.classify([2,30,4,50,6,2,7,4,90]));
    });
  });
  /* valid gestures:
  * 1. start mic
  * 2. stop
  * 3. walking 
  * 4. circle
  */
  describe('set',function(){
    it('should set a pair (glove_data,gesture)',function(){
      var recognizer = new gestureRecognizer();
      var test_data = fs.readFileSync('./g1425979269384.csv','utf-8');
      recognizer.load(test_data);
      recognizer.set(test_data[0],recognizer.GESTURE_START_MIC);
      assert.equal(1,recognizer.trainingSet.length);
    });
  });

  describe('train',function(){
    it('should train the training set made by pairs (glove_data,gesture)',function(){
      var recognizer = new gestureRecognizer();
      var data = fs.readFileSync('./g1425979269384.csv','utf-8');
      var test_data = recognizer.load(data);
      recognizer.set(test_data[0],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[1],recognizer.GESTURE_STOP);
      recognizer.set(test_data[2],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[3],recognizer.GESTURE_CIRCLE);
      recognizer.set(test_data[4],recognizer.GESTURE_WALKING);

      recognizer.train(net,recognizer.trainingSet);
      //TODO assert
    });
  });
  describe('run',function(){
    it('should run the trained neural network',function(){
      var recognizer = new gestureRecognizer();
      var data = fs.readFileSync('./g1425979269384.csv','utf-8');
      var test_data = recognizer.load(data);
      recognizer.set(test_data[0],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[1],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[2],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[3],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[4],recognizer.GESTURE_START_MIC);

      recognizer.train(net,recognizer.trainingSet);
      var output = recognizer.run(net,[-0.44,0.43,0.80,-30.47,-29.83,6.47,23.28,14.06,-289.80]);
      console.log("circle is " + output.circle);
      console.log("stop is " + output.stop);
      console.log("walking is " + output.walking);
      console.log("start mic is " + output.mic);
    });
  });

  
});
