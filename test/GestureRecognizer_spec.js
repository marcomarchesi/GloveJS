var assert = require("assert");
var gestureRecognizer = require("../lib/GestureRecognizer.js");
// var recognizer = new gestureRecognizer();
var test_data = [[23,45,6],[34,4,6],[4,35,2],[2,5,9],[3,25,89]];
var brain = require('brain');
var net = new brain.NeuralNetwork();

describe('GestureRecognizer', function(){
  describe('load', function(){
    it('should return the data loaded', function(){
      var recognizer = new gestureRecognizer();
      assert.equal(5, recognizer.load(test_data).length);
      // assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
  describe('cluster',function(){
    it('should return the clusters', function(){
      var recognizer = new gestureRecognizer();
      recognizer.data = test_data;
      assert.equal(2, recognizer.cluster(2).length);
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
      recognizer.set(test_data[0],recognizer.GESTURE_START_MIC);
      assert.equal(1,recognizer.trainingSet.length);
    });
  });

  describe('train',function(){
    it('should train the training set made by pairs (glove_data,gesture)',function(){
      var recognizer = new gestureRecognizer();
      recognizer.set(test_data[0],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[1],recognizer.GESTURE_STOP);
      recognizer.set(test_data[2],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[3],recognizer.GESTURE_CIRCLE);
      recognizer.set(test_data[4],recognizer.GESTURE_WALKING);

      recognizer.train(net,recognizer.trainingSet);
      //TODO assert
    });
  describe('run',function(){
    it('should run the trained neural network',function(){
      var recognizer = new gestureRecognizer();
      recognizer.set(test_data[0],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[1],recognizer.GESTURE_STOP);
      recognizer.set(test_data[2],recognizer.GESTURE_START_MIC);
      recognizer.set(test_data[3],recognizer.GESTURE_CIRCLE);
      recognizer.set(test_data[4],recognizer.GESTURE_WALKING);

      recognizer.train(net,recognizer.trainingSet);
      var output = recognizer.run(net,[34,5,6]);
      console.log(output.circle);
      console.log(output.walking);

    });
  })

  });

});
