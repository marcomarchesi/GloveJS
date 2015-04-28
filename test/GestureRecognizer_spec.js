// /* unit tests for GestureRecognizer.js
// */

// var assert = require("assert");
// var gestureRecognizer = require("../glove_module/lib/GestureRecognizer.js");
// var fs = require('fs');
// var brain = require('brain');
// var net = new brain.NeuralNetwork();

// describe('GestureRecognizer', function(){

//   describe('load', function(){
//     it('should return the data loaded', function(){
//       var recognizer = new gestureRecognizer();
//       var data = fs.readFileSync('./training_set/GESTURE_CIRCLE.csv','utf-8');
//       assert.equal(33, recognizer.load(data).length);
//     });
//   });

//   // describe('cluster',function(){
//   //   it('should return the clusters', function(){
//   //     var recognizer = new gestureRecognizer();
//   //     var training_data = fs.readFileSync('./training_set/circle.csv','utf-8');
//   //     recognizer.load(training_data);
//   //     assert.equal(2, recognizer.cluster(2).length);
//   //   });
//   // });

//   // describe('classify',function(){
//   //   it('should cluster a new value from the glove',function(){
//   //     var recognizer = new gestureRecognizer();
//   //     var training_data = fs.readFileSync('./training_set/circle.csv','utf-8');
//   //     recognizer.load(training_data);
//   //     recognizer.cluster(2);
//   //     console.log(recognizer.classify([2,30,4,50,6,2,7,4,90]));
//   //   });
//   // });
//   // /* valid gestures:
//   // * 1. start mic
//   // * 2. stop
//   // * 3. walking 
//   // * 4. circle
//   // */
//   // describe('set',function(){
//   //   it('should set a pair (glove_data,gesture)',function(){
//   //     var recognizer = new gestureRecognizer();
//   //     var data = fs.readFileSync('./training_set/no_gesture.csv','utf-8');
//   //     var unlabeled_set = recognizer.load(data);
//   //     recognizer.set(unlabeled_set,recognizer.GESTURE_NONE);
//   //     assert.equal(596,recognizer.trainingSet.length);
//   //   });
//   // });

//   // describe('train',function(){
//   //   it('should train the training set made by pairs (glove_data,gesture)',function(){
//   //     var recognizer = new gestureRecognizer();
//   //     var unlabeled_set = [];

//   //     var data = fs.readFileSync('./training_set/GESTURE_CIRCLE.csv','utf-8');
//   //     unlabeled_set = recognizer.load(data);
//   //     recognizer.set(unlabeled_set,recognizer.GESTURE_CIRCLE);
      
//   //     data = fs.readFileSync('./training_set/GESTURE_START_MIC.csv','utf-8');
//   //     unlabeled_set = recognizer.load(data);
//   //     recognizer.set(unlabeled_set,recognizer.GESTURE_START_MIC);
      
//   //     data = fs.readFileSync('./training_set/GESTURE_STOP.csv','utf-8');
//   //     unlabeled_set = recognizer.load(data);
//   //     recognizer.set(unlabeled_set,recognizer.GESTURE_STOP);
      
//   //     data = fs.readFileSync('./training_set/GESTURE_WALKING.csv','utf-8');
//   //     unlabeled_set = recognizer.load(data);
//   //     recognizer.set(unlabeled_set,recognizer.GESTURE_WALKING);

//   //     recognizer.train(net,recognizer.trainingSet);

//   //     assert.equal(86,recognizer.trainingSet.length); //10 samples for each gesture
//   //   });
//   // });
//   describe('run',function(){
//     it('should run the trained neural network',function(){
//       var recognizer = new gestureRecognizer();
//       var sample = [0.26,-0.07,1.13,38.05,-8.89,87.93,135.80,20.86,-344.40,
//                     0.50,-0.12,0.90,41.74,-39.77,-131.20,119.31,-98.45,-330.75,
//                     0.11,0.00,0.83,-56.90,-13.83,-100.80,122.22,15.04,-349.65,
//                     -0.15,-0.18,1.02,-72.28,-47.08,0.63,100.88,194.48,-334.95,
//                     0.35,-0.32,1.03,20.45,-18.63,127.44,99.91,202.25,-325.50,
//                     0.23,-0.24,0.92,15.03,-1.72,12.66,128.04,114.94,-337.05];
//       // var unlabeled_set = [];
//       // var data = fs.readFileSync('./training_set/circle.csv','utf-8');
//       // unlabeled_set = recognizer.load(data);
//       // recognizer.set(unlabeled_set,recognizer.GESTURE_CIRCLE);
//       // data = fs.readFileSync('./training_set/start_mic.csv','utf-8');
//       // unlabeled_set = recognizer.load(data);
//       // recognizer.set(unlabeled_set,recognizer.GESTURE_START_MIC);
//       // data = fs.readFileSync('./training_set/stop.csv','utf-8');
//       // unlabeled_set = recognizer.load(data);
//       // recognizer.set(unlabeled_set,recognizer.GESTURE_STOP);
//       // data = fs.readFileSync('./training_set/walking.csv','utf-8');
//       // unlabeled_set = recognizer.load(data);
//       // recognizer.set(unlabeled_set,recognizer.GESTURE_WALKING);

//       // recognizer.train(net,recognizer.trainingSet);
//       var network = JSON.parse(fs.readFileSync('./trained_net.json','utf-8'));
//       net.fromJSON(network);

//       var output = recognizer.run(net,sample);
//       console.log("no gesture is " + output.none);
//       console.log("circle is " + output.circle);
//       console.log("stop is " + output.stop);
//       console.log("walking is " + output.walking);
//       console.log("start mic is " + output.mic);
//     });
//   });

  
// });
