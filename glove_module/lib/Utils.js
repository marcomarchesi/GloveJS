

function Utils(){
  

}

Utils.prototype.normalize = function(array){

  var output_array = [];
        var tempMean = 0;
        console.log("the array length is " + array.length);
        for (var i = 0;i<array.length;++i){
          tempMean += Number(array[i]);
        }
        tempMean /= array.length;
        // console.log("Mean is " + tempMean);
        var variance = 0;
        for (var i = 0;i<array.length;++i){
          variance += (array[i] - tempMean)*(array[i] - tempMean);
        }
        variance /= array.length;
        var std = Math.sqrt(variance);
        // console.log("Standard deviation is " + std);
        for (var i = 0;i<array.length;++i){
          output_array.push(((array[i] - tempMean)/std).toFixed(4));
        }
      return output_array;
};

module.exports = Utils;