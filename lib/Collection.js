var inherits = require('inherits');

module.exports = Collection;

function Collection() {
  Array.apply(this, arguments);
}

inherits(Collection, Array);


Collection.prototype.toJson = function() {
  return this.map(function(elem) {
    return elem.toJson();
  });
};

Collection.prototype.toDb = function() {
  return this.map(function(elem) {
    return elem.toDb();
  });
};

Collection.prototype.toObject = function() {
  return this.map(function(elem) {
    return elem.toObject();
  });
};
