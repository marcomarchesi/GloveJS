var assert = require("assert");
var gestureRecognizer = require("../lib/GestureRecognizer.js");
var recognizer = new gestureRecognizer();
var test_data = [[23,45,6],[34,4,6],[4,35,2],[2,5,9],[3,25,89]];

describe('GestureRecognizer', function(){
  describe('load', function(){
    it('should return the data loaded', function(){
      assert.equal(5, recognizer.load(test_data).length);
      // assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
  describe('cluster',function(){
    it('should return the clusters', function(){
      recognizer.data = test_data;
      assert.equal([], recognizer.cluster(2));
    });
  });

});
