var utils = require('./utils');
var Promise = require('bluebird');
var Field = require('./fields/Field');
var ValidationError = require('./errors');
var foreach = require('lodash/forEach');
var assign = require('lodash/assign')

/**
 * Creates a new model
 *
 * @param obj The object to initialize the model instance
 * @param options
 * @returns {Model}
 * @constructor
 */
function Model(obj, options) {
  if (!(this instanceof Model))
    return new Model(obj, options);

  this.Class = Model;
  Model.__initialize(obj, options);
}

Model.__initialize = function(obj, options) {
  this.__modelMetadata = {};

  this.__modelMetadata.options = utils.defaults({}, options, {
    setDefaults: true,
    schemas: Model.__schemas,
    schemaParser: Model.__schemaParser,
    defineProperties: true
  })
  this.__modelMetadata.parent = this.__modelMetadata.options.parent;
  this.__modelMetadata.schemas = this.__modelMetadata.options.schemas;
  //instantiate and initialize the data
  this.__modelMetadata.data = this._instantiateSchema(this.__modelMetadata.schemas.normalized,
    this.__modelMetadata.schemas.typed);

  //define properties
  if(this.__modelMetadata.options.defineProperties) {
    for(var prop in this.__modelMetadata.data) {
      if(this.__modelMetadata.data.hasOwnProperty(prop)) {
        utils.defineProperty(this, this, prop);
      }
    }
  }

  this.set(obj);

  if(this.__modelMetadata.options.setDefaults) {
    this.setDefault();
  }
};

Model.__schemas = {
  normalized: {},
  type: {}
};


Model.prototype.getParent = function() {
  return this.__modelMetadata.parent
}

Model.prototype.validate = function(callback, options) {
  if(callback && (typeof callback !== 'function')) {
    options = callback
    callback = null
  }
  options = options || {}

  var done = callback;
  var promise

  if(!callback) {
    promise = new Promise(function(resolve, reject) {
      done = function(err, val) {
        if(err) return reject(err);
        resolve(val);
      }
    });
  }

  var errors = {};
  var running = Object.keys(this.__modelMetadata.data).length;

  foreach(this.__modelMetadata.data, function(d, prop) {
    d.validate(function(e) {
      if(e) {
        ValidationError.append(errors, prop, e);
      }
      completeValidation()
    }, options)
  });

  function completeValidation() {
    if(--running === 0) {
      done(utils.isEmpty(errors) ? null : new ValidationError.Collection(errors));
    }
  }

  return callback ? undefined : promise;
};


Model.prototype._instantiateType = function(descriptor, type, parent) {
  parent = parent || this;
  if(utils.isSubclass(type, Model)) {
    return new type(undefined, {
      parent: parent,
      //we set defaults later, when we have a full data object (when initializing the parent)
      setDefaults: false,
      defineProperties: this.__modelMetadata.options.defineProperties
    });
  } else {
    return new type(descriptor, parent);
  }
};

/**
 * Instantiate the typed schema creating actual objects out of the typed schema.
 *
 * @param schema Raw normalized descriptor
 * @param typedSchema Typed schema
 * @returns {} The instantiated schema
 * @private
 */
Model.prototype._instantiateSchema = function(schema, typedSchema) {
  var data = {};
  for(var prop in typedSchema) {
    if(typedSchema.hasOwnProperty(prop)) {
      data[prop] = this._instantiateType(schema[prop], typedSchema[prop], this);
    }
  }
  return data;
};

/**
 * Force all the Fields in the data to set their default value
 */
Model.prototype.setDefault = function() {
  for(var prop in this.__modelMetadata.data) {
    if(this.__modelMetadata.data.hasOwnProperty(prop)) {
      this.__modelMetadata.data[prop].setDefault();
    }
  }
};

/**
 * Recursively invoke a get method on the path specified
 *
 * @param method can be "get" or "getRaw"
 * @param path
 * @returns the value of the property
 * @private
 */
Model.prototype._genericGet = function(method, path) {
  if(!path) {
    if(method === 'get') {
      return this.toView('all', true);
    }

    return this;
  }

  var paths = path.split('.');
  if(paths.length > 1) {
    //TODO should we check for field type also?
    //is deep into another model
    return this.__modelMetadata.data[paths[0]] && this.__modelMetadata.data[paths[0]][method](paths.slice(1).join('.'));
  } else {
    return this.__modelMetadata.data[path] && this.__modelMetadata.data[path][method]();
  }
};


Model.prototype.get = function(path) {
  return this._genericGet('get', path);
};


Model.prototype.getRaw = function(path) {
  return this._genericGet('getRaw', path);
};

/**
 * Recursively invoke set until it reaches the property specified in the path.
 *
 * @param method one between "set" and "setRaw"
 * @param path
 * @param val
 * @private
 */
Model.prototype._genericSet = function(method, path, val) {
  if(!path) {
    return;
  }

  if(typeof path === 'string') {
    var paths = path.split('.');
    if(paths.length > 1) {
      //is another model
      this.__modelMetadata.data[paths[0]] && this.__modelMetadata.data[paths[0]][method](paths.slice(1).join('.'), val);
    } else {
      this.__modelMetadata.data[path] && this.__modelMetadata.data[path][method](val);
    }
  } else {
    val = path;
    if(val instanceof Model) {
      val = val.toView('all')
    }

    for(var prop in val) {
      if(val.hasOwnProperty(prop)) {
        this[method](prop, val[prop]);
      }
    }
  }
};

Model.prototype.set = function(path, val) {
  return this._genericSet('set', path, val);
};

Model.prototype.setRaw = function(path, val) {
  return this._genericSet('setRaw', path, val);
};

/**
 * Exports the data in this model, in Object format
 *
 * @param where one between "all", "Object", "Json", "Db"
 * @param bound If true, it will create an object with each property bound to this model's properties
 * (two way binding). Otherwise it will just create a copy of the data in this model.
 *
 * @returns {{}}
 * @private
 */
Model.prototype._export = Model.prototype.toView = function(where, bound) {
  var obj = {};
  var exp;

  for(var key in this.__modelMetadata.data) {
    if(this.__modelMetadata.data.hasOwnProperty(key)) {
      var field = this.__modelMetadata.data[key];
      if(where === "all" || !field.inView || field.inView(where)) {
        if(bound) {
          utils.defineProperty(obj, this, key);
        } else {
          exp = field._export(where, bound);
          //omit undefined props
          if(exp !== void 0) {
            obj[key] = exp;
          }
        }
      }
    }
  }

  return obj;
};

Model.prototype.toObject = function() {
  return this.toView('object');
};

Model.prototype.toDb = function() {
  return this.toView('db');
};

Model.prototype.toJson = function() {
  return this.toView('json');
};

module.exports = Model;
