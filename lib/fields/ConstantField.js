var Field = require('./Field');
var utils = require('../utils');
var inherits = require('inherits');

function ConstantField(descriptor, parent) {
  if (!(this instanceof ConstantField))
    return new ConstantField(descriptor, parent);

  Field.call(this, descriptor, parent);
  this.value = descriptor.value;
}
module.exports = ConstantField;
inherits(ConstantField, Field);

ConstantField.isTypeOf = function(descriptor) {
  return descriptor.type === 'constant';
};

ConstantField.prototype.set = function() {
  //do nothing
}

ConstantField.prototype.setRaw = function() {
  //do nothing
}
