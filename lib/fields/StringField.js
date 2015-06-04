var Field = require('./Field'),
  Errors = require('../errors'),
  utils = require('../utils'),
  inherits = require('inherits');

module.exports = StringField;

inherits(StringField, Field);

function StringField(descriptor, parent) {
  if (!(this instanceof StringField))
    return new StringField(descriptor, parent);

  Field.call(this, descriptor, parent);
  
  this.validators.push(this._validateIsString);
  if(descriptor.required) {
    this.validators.push(this._validateIsRequiredString);
  }
}


StringField.prototype.setDefault = function() {
  if(!this.value && this.descriptor.default !== void 0) {
    this.set(utils.getValue(this.descriptor.default, this));
  }
};

StringField.isTypeOf = function(descriptor) {
  return descriptor.type === String;
};


StringField.prototype._validateIsString = function(done) {
  if(this.value && !utils.isString(this.value)) {
    return done(new Errors("wrong_type", {type: "String"}));
  }
  done();
};

StringField.prototype._validateIsRequiredString = function(done) {
  if(utils.isEmpty(this.value)) {
    return done(new Errors("required"));
  }
  done();
};

StringField.prototype._cast = function(val) {
  if(val) {
    return val.toString();
  }
  return val;
};


