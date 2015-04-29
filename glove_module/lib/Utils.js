

function Utils(){
  

}

Utils.prototype.normalize = function(array,mean,std){

  var output_array = [];
        // var tempMean = 0;
        // console.log("the array length is " + array.length);
        // for (var i = 0;i<array.length;++i){
        //   tempMean += Number(array[i]);
        // }
        // tempMean /= array.length;
        // console.log("Mean is " + tempMean);
        // var variance = 0;
        // for (var i = 0;i<array.length;++i){
        //   variance += (array[i] - tempMean)*(array[i] - tempMean);
        // }
        // variance /= array.length;
        // var std = Math.sqrt(variance);
        // // standard deviation is approximately range/4
        // console.log("Standard deviation is " + std);
        for (var i = 0;i<array.length;++i){
          output_array.push(((array[i] - mean)/std).toFixed(4));
        }
      return output_array;
};

module.exports = Utils;