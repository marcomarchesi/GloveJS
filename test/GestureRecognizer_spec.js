/* unit tests for GestureRecognizer.js
*/

var assert = require("assert");
var gestureRecognizer = require("../lib/GestureRecognizer.js");
var fs = require('fs');
var brain = require('brain');
var net = new brain.NeuralNetwork();

describe('GestureRecognizer', function(){

  describe('load', function(){
    it('should return the data loaded', function(){
      var recognizer = new gestureRecognizer();
      var data = fs.readFileSync('./training_set/circle.csv','utf-8');
      assert.equal(10, recognizer.load(data).length);
    });
  });

  // describe('cluster',function(){
  //   it('should return the clusters', function(){
  //     var recognizer = new gestureRecognizer();
  //     var training_data = fs.readFileSync('./training_set/circle.csv','utf-8');
  //     recognizer.load(training_data);
  //     assert.equal(2, recognizer.cluster(2).length);
  //   });
  // });

  // describe('classify',function(){
  //   it('should cluster a new value from the glove',function(){
  //     var recognizer = new gestureRecognizer();
  //     var training_data = fs.readFileSync('./training_set/circle.csv','utf-8');
  //     recognizer.load(training_data);
  //     recognizer.cluster(2);
  //     console.log(recognizer.classify([2,30,4,50,6,2,7,4,90]));
  //   });
  // });
  // /* valid gestures:
  // * 1. start mic
  // * 2. stop
  // * 3. walking 
  // * 4. circle
  // */
  describe('set',function(){
    it('should set a pair (glove_data,gesture)',function(){
      var recognizer = new gestureRecognizer();
      var data = fs.readFileSync('./training_set/circle.csv','utf-8');
      var unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_CIRCLE);
      assert.equal(10,recognizer.trainingSet.length);
    });
  });

  describe('train',function(){
    it('should train the training set made by pairs (glove_data,gesture)',function(){
      var recognizer = new gestureRecognizer();
      var unlabeled_set = [];

      var data = fs.readFileSync('./training_set/circle.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_CIRCLE);
      
      data = fs.readFileSync('./training_set/start_mic.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_START_MIC);
      
      data = fs.readFileSync('./training_set/stop.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_STOP);
      
      data = fs.readFileSync('./training_set/walking.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_WALKING);
      
      data = fs.readFileSync('./training_set/no_gesture.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_NONE);

      recognizer.train(net,recognizer.trainingSet);

      assert.equal(50,recognizer.trainingSet.length); //10 samples for each gesture
    });
  });
  // describe('run',function(){
  //   it('should run the trained neural network',function(){
  //     var recognizer = new gestureRecognizer();
  //     var sample = [0.61,0.70,0.23,55.10,-101.76,5.43,-215.34,-357.44,-185.85,
  //                   -0.00,0.61,0.02,-43.69,-96.47,-36.03,-228.92,-381.69,-116.55,
  //                   -0.36,0.93,0.26,-88.49,-11.32,-76.80,-188.18,-357.44,-186.90,
  //                   -0.69,1.13,0.60,-131.83,82.03,30.68,-96.03,-253.66,-320.25,
  //                   -0.03,1.13,1.05,79.51,79.60,135.44,0.00,-188.66,-346.50,
  //                   0.06,0.54,0.23,110.54,-43.81,34.71,-90.21,-366.18,-215.25];
  //     // var sample = [0.14,-1.36,0.15,61.57,-12.78,219.27,-8.73,442.81,-117.60,
  //     //               0.08,-0.86,0.10,-30.40,-2.90,-150.61,60.14,417.58,-140.70,
  //     //               -0.22,-1.48,0.23,-53.50,-10.56,-190.68,-350.17,358.41,-58.80,
  //     //               -0.27,-1.00,0.18,20.66,-8.12,84.80,-415.16,284.69,-48.30,
  //     //               0.06,-1.42,0.15,51.41,-10.07,242.37,-94.09,453.47,-96.60,
  //     //               0.10,-0.78,0.10,-23.03,-20.99,-102.54,68.87,419.52,-131.25];
  //     console.log(sample.length);
  //     // var unlabeled_set = [];
  //     // var data = fs.readFileSync('./training_set/circle.csv','utf-8');
  //     // unlabeled_set = recognizer.load(data);
  //     // recognizer.set(unlabeled_set,recognizer.GESTURE_CIRCLE);
  //     // data = fs.readFileSync('./training_set/start_mic.csv','utf-8');
  //     // unlabeled_set = recognizer.load(data);
  //     // recognizer.set(unlabeled_set,recognizer.GESTURE_START_MIC);
  //     // data = fs.readFileSync('./training_set/stop.csv','utf-8');
  //     // unlabeled_set = recognizer.load(data);
  //     // recognizer.set(unlabeled_set,recognizer.GESTURE_STOP);
  //     // data = fs.readFileSync('./training_set/walking.csv','utf-8');
  //     // unlabeled_set = recognizer.load(data);
  //     // recognizer.set(unlabeled_set,recognizer.GESTURE_WALKING);

  //     // recognizer.train(net,recognizer.trainingSet);
  //     var network = JSON.parse(fs.readFileSync('./trained_net.json','utf-8'));
  //     net.fromJSON(network);

  //     var output = recognizer.run(net,sample);
  //     console.log("circle is " + output.circle);
  //     console.log("stop is " + output.stop);
  //     console.log("walking is " + output.walking);
  //     console.log("start mic is " + output.mic);
  //   });
  // });

  
});
