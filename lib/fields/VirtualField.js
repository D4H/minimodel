var Field = require('./Field');
var utils = require('../utils.js');
var inherits = require('inherits');

function VirtualField(descriptor, parent) {
  //By default do not include Virtuals
  var newDescriptor = {}
  newDescriptor.views = utils.assign({
    object: false,
    json: false,
    db: false
  }, descriptor && descriptor.views)
  utils.assign(newDescriptor, utils.omit(descriptor, 'views'))
  
  if (!(this instanceof VirtualField))
    return new VirtualField(newDescriptor, parent);
  
  Field.call(this, newDescriptor, parent);
}
inherits(VirtualField, Field);


VirtualField.prototype.setRaw = VirtualField.prototype._set = function(val) {
};

VirtualField.prototype.getRaw = VirtualField.prototype._get = function() {
};
module.exports = VirtualField;

