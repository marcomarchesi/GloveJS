/* unit tests for GestureRecognizer.js
*/

var assert = require("assert");
var gestureRecognizer = require("../glove_module/lib/GestureRecognizer.js");
var fs = require('fs');
var brain = require('brain');
var net = new brain.NeuralNetwork();

describe('GestureRecognizer', function(){

  describe('load', function(){
    it('should return the data loaded', function(){
      var recognizer = new gestureRecognizer();
      var data = fs.readFileSync('./training_set/GESTURE_CIRCLE.csv','utf-8');
      assert.equal(33, recognizer.load(data).length);
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
  // describe('set',function(){
  //   it('should set a pair (glove_data,gesture)',function(){
  //     var recognizer = new gestureRecognizer();
  //     var data = fs.readFileSync('./training_set/no_gesture.csv','utf-8');
  //     var unlabeled_set = recognizer.load(data);
  //     recognizer.set(unlabeled_set,recognizer.GESTURE_NONE);
  //     assert.equal(596,recognizer.trainingSet.length);
  //   });
  // });

  describe('train',function(){
    it('should train the training set made by pairs (glove_data,gesture)',function(){
      var recognizer = new gestureRecognizer();
      var unlabeled_set = [];

      var data = fs.readFileSync('./training_set/GESTURE_CIRCLE.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_CIRCLE);
      
      data = fs.readFileSync('./training_set/GESTURE_START_MIC.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_START_MIC);
      
      data = fs.readFileSync('./training_set/GESTURE_STOP.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_STOP);
      
      data = fs.readFileSync('./training_set/GESTURE_WALKING.csv','utf-8');
      unlabeled_set = recognizer.load(data);
      recognizer.set(unlabeled_set,recognizer.GESTURE_WALKING);

      recognizer.train(net,recognizer.trainingSet);

      assert.equal(63,recognizer.trainingSet.length); //10 samples for each gesture
    });
  });
  // describe('run',function(){
  //   it('should run the trained neural network',function(){
  //     var recognizer = new gestureRecognizer();
  //     var sample = [-0.11,-2.77,0.22,74.71,-2.00,429.70,-208.55,439.89,-82.95,
  //                   0.27,-0.46,0.04,16.14,-23.01,25.11,269.66,240.07,-179.55,
  //                   -0.09,-2.43,0.28,-71.72,11.56,-396.38,-171.69,444.75,-106.05,
  //                   -0.41,-0.86,0.10,5.91,58.94,-41.95,-457.84,194.48,-97.65,
  //                   -0.25,-1.86,0.21,30.19,-33.17,255.93,-375.39,323.50,-85.05,
  //                   0.26,-0.99,0.12,44.66,35.43,199.79,212.43,321.56,-161.70];
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
  //     console.log("no gesture is " + output.none);
  //     console.log("circle is " + output.circle);
  //     console.log("stop is " + output.stop);
  //     console.log("walking is " + output.walking);
  //     console.log("start mic is " + output.mic);
  //   });
  // });

  
});
