var utils = require('../utils');
var ValidationError = require('../errors');
var op = require('object-path');

function Field(descriptor, parent) {
  if (!(this instanceof Field))
    return new Field(descriptor, parent);

  this.value = undefined;
  this.parent = parent;
  this.descriptor = {}
  this.descriptor.views = utils.assign({
    object: true,
    json: true,
    db: true
  }, descriptor && descriptor.views)
  utils.assign(this.descriptor, utils.omit(descriptor, 'views'))
  
  this.validators = [];

  if(descriptor.get) {
    this._get = utils.bind(descriptor.get, this);
  }

  if(descriptor.set) {
    this._set = utils.bind(descriptor.set, this);
  }

  if(descriptor.cast) {
    this._cast = utils.bind(descriptor.cast, this);
  }

  if(descriptor.validate) {
    this.validators.push(descriptor.validate);
  }

  if(descriptor.required) {
    this.validators.push(this._validateRequired);
  }
}

Field.prototype._validateRequired = function(done, options) {
  if(options.ignoreMissing) {
    return done()
  }
  
  if(this.value === void 0 || this.value === null) {
    done(new ValidationError("required"));
  } else {
    done();
  }
};

Field.prototype.setDefault = function() {
  if(this.get() === void 0 && this.descriptor.default !== void 0) {
    this.set(utils.getValue(this.descriptor.default, this));
  }
};

Field.prototype.getParent = function() {
  return this.parent
};

Field.prototype.get = function() {
  return this._get();
};

Field.prototype.set = function(val) {
  val = this._cast(val);
  this._set(val);
};

Field.prototype.setRaw = Field.prototype._set = function(val) {
  this.value = val;
};

Field.prototype.getRaw = Field.prototype._get = function() {
  return this.value;
};

/**
 * Do not override
 */
Field.prototype.validate = function(callback, options) {
  var self = this;
  if(!this.validators) {
    process.nextTick(callback)
  } 
  
  (function iterator(i) {
    if(i >= self.validators.length) {
      return callback();
    }
    
    var v = self.validators[i];
    try {
      v.call(self, function(err) {
        if(err) return callback(err);
        iterator(i + 1);
      }, options)
    } catch(err) {
      return callback(err);
    }
  })(0);
};

Field.prototype._cast = function(val) {
  return val;
};

Field.prototype._export = function() {
  return utils.exportDeep(this.get());
};

Field.prototype.inView = function(view) {
  return this.descriptor.views && this.descriptor.views[view]
};

module.exports = Field;
