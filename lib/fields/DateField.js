var Field = require('./Field'),
  utils = require('../utils'),
  Errors = require('../errors'),
  inherits = require('inherits');

module.exports = DateField;

inherits(DateField, Field);

function DateField(descriptor, parent) {
  if (!(this instanceof DateField))
    return new DateField(descriptor, parent);

  Field.call(this, descriptor, parent);
  
  this.validators.push(this._validateIsValidDate);
}

DateField.isTypeOf = function(descriptor) {
  return descriptor.type === Date;
};

DateField.prototype._export = function() {
  return this.value && this.value.getTime();
};

DateField.prototype._validateIsValidDate = function(done) {
  if(this.value && isNaN(this.value.getTime())) {
    return done(new Errors("wrong_type", {type: "Date"}));
  }
  done();
};

DateField.prototype._cast = function(val) {
  if(val) {
    var date =  new Date(val);
    if(isNaN(date.getTime()) && utils.isString(val)) {
      //try to convert to int
      return new Date(parseInt(val, 10));
    }
    return date;
  }
  return val;
};

