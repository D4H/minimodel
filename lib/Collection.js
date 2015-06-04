
module.exports = function(arr) {
  if(!arr) {
    arr = []
  }
  
  arr.toJson = function() {
    return this.map(function(elem) {
      return elem.toJson();
    });
  };

  arr.toDb = function() {
    return this.map(function(elem) {
      return elem.toDb();
    });
  };

  arr.toObject = function() {
    return this.map(function(elem) {
      return elem.toObject();
    });
  };

  arr.toView = function(view) {
    return this.map(function(elem) {
      return elem.toView(view);
    });
  };
  
  return arr;
};