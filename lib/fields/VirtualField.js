var Field = require('./Field');
var utils = require('../utils.js');
var inherits = require('inherits');
var merge = require('lodash.merge');

function VirtualField(descriptor, parent) {
  //By default do not include Virtuals
  descriptor = merge({
    views: {
      object: false,
      json: false,
      db: false
    }
  }, descriptor);
  if (!(this instanceof VirtualField))
    return new VirtualField(descriptor, parent);
  
  Field.call(this, descriptor, parent);
}
inherits(VirtualField, Field);


VirtualField.prototype.setRaw = VirtualField.prototype._set = function(val) {
};

VirtualField.prototype.getRaw = VirtualField.prototype._get = function() {
};
module.exports = VirtualField;

