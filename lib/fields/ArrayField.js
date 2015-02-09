var Field = require('./Field');
var utils = require('../utils');
var Errors = require('../errors');
var inherits = require('inherits');

module.exports = ArrayField;

function ArrayField(descriptor, model) {
  if (!(this instanceof ArrayField))
    return new ArrayField(descriptor, model);

  Field.call(this, descriptor, model);

  var arrayType = model.__modelMetadata.options.schemaParser.parseField(descriptor.type[0]);

  this.arrayType = arrayType.typed;
  this.arraySchema = arrayType.normalized;
}
inherits(ArrayField, Field);

ArrayField.isTypeOf = function(descriptor) {
  return descriptor.type.length === 1 &&
    Object.prototype.toString.call(descriptor.type) == '[object Array]';
};

ArrayField.prototype.validate = function(done) {
  if(!this.value) {
    return done();
  }

  if(typeof this.value.length != 'number' || !Array.isArray(this.value)) {
    return done(Errors("wrong_type", {type: "Array"}));
  }

  var self = this;
  var errors = {};
  (function iterator(i) {
    if(i >= self.value.length) {
      return done(utils.isEmpty(errors) ? null : errors);
    }
    
    var v = self.value[i];
    v.validate(function(errs) {
      if(errs) {
        Errors.append(errors, i, errs);
      }
      iterator(i + 1);
    });
  })(0);
};

ArrayField.prototype.get = function(path) {
  if(path) {
    return this._deepGet("get", path);
  } else {
    return this._get(path);
  }
};

ArrayField.prototype.set = function(path, val) {
  if(val) {
    this._deepSet("set", path, val);
  } else {
    path = this._cast(path);
    this._set(path);
  }
};

ArrayField.prototype._set = function(val) {
  this.setRaw(val);
};


ArrayField.prototype._get = function() {
  return this.getRaw();
};


ArrayField.prototype.setRaw = function(path, val) {
  var self = this;
  if(!val) {
    //set the whole array
    
    val = path;
    var value = [];
    val.forEach(function(arrVal) {
      var typedVal = self._newItem();
      typedVal.set(arrVal);

      value.push(typedVal);
    });
    self.value = value;
  } else {
    //go deep into some other property
    
    self._deepSet('setRaw', path, val);
  }
};


ArrayField.prototype._newItem = function() {
  return this.model._instantiateType(this.arraySchema, this.arrayType, this.model);
};


ArrayField.prototype._deepSet = function(method, path, val) {
  var paths = path.split('.');
  var idx;
  if(paths.length > 1) {
    idx = paths[0];
  } else {
    idx = path;
  }

  if(isNaN(idx)) {
    throw new Error("Invalid index :" + idx);
  }

  if(!this.value[idx]) {
    //create the element if it doesn't exists
    this.value[idx] = this._newItem();
  }
  
  if(paths.length > 1) {
    this.value[idx][method](paths.slice(1).join('.'), val);
  } else {
    this.value[idx][method](val);
  }
};


ArrayField.prototype.getRaw = function(path) {
  var self = this;
  if(!path) {
    if(!this.value) {
      return this.value;
    }
    
    var ret = [];
    this.value.forEach(function(arrVal) {
      ret.push(arrVal._export('all', true));
    });
    return ret;
  } else {
    return this._deepGet('getRaw', path);
  }
};


ArrayField.prototype._deepGet = function(method, path) {
  var paths = path.split('.');
  var idx;
  if(paths.length > 1) {
    idx = paths[0];
    if(isNaN(idx)) {
      throw new Error("Invalid index :" + idx);
    }

    return this.value[idx] && this.value[idx][method](paths.slice(1).join('.'));
  } else {
    idx = path;
    if(isNaN(idx)) {
      throw new Error("Invalid index :" + idx);
    }
    return this.value[idx] && this.value[idx][method]();
  }
};


ArrayField.prototype._export = function(where, bound) {
  if(!this.value) {
    return this.value;
  }
  
  return this.value.map(function(elem) {
    return elem._export(where, bound);
  });
};


