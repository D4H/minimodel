var Field = require('./Field');
var utils = require('../utils');
var inherits = require('inherits');

function ConstantField(descriptor, model) {
  if (!(this instanceof ConstantField))
    return new ConstantField(descriptor, model);

  Field.call(this, descriptor, model);
  this.value = descriptor.value;
}
module.exports = ConstantField;
inherits(ConstantField, Field);

ConstantField.isTypeOf = function(descriptor) {
  return descriptor.type === 'constant';
};

ConstantField.prototype.set = function(val) {
  //do nothing
};
