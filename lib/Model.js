var defaults = require('lodash.defaults');
var utils = require('./utils');
var Promise = require('bluebird');
var Field = require('./fields/Field');
var Errors = require('./errors');
var foreach = require('lodash.foreach');

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

  this.options = defaults({}, options, {
    setDefaults: true,
    schemas: Model.__schemas,
    schemaParser: Model.__schemaParser
  });
  this.parent = this.options.parent;
  this.schemas = this.options.schemas;
  //instantiate and initialize the data
  this.data = this._instantiateSchema(this.schemas.normalized, this.schemas.typed);

  //define properties
  //TODO make this optional?
  for(var prop in this.data) {
    if(this.data.hasOwnProperty(prop)) {
      utils.defineProperty(this, this, prop);
    }
  }

  this.set(obj);

  if(this.options.setDefaults) {
    this.setDefault();
  }
}

Model.__schemas = {
  normalized: {},
  type: {}
};


Model.prototype.validate = function(callback) {
  var done = callback;
  if(!callback) {
    var promise = Promise.fromNode(function(callback) {
      done = callback;
    });
  }

  var errors = {};
  var running = 0;
  foreach(this.data, function(d, prop) {
    running++;
    d.validate(function(e) {
      if(e) {
        Errors.append(errors, prop, e);
      }
      if(--running === 0) {
        done(utils.isEmpty(errors) ? null : errors);
      }
    });
  });

  return callback ? undefined : promise;
};


Model.prototype._instantiateType = function(descriptor, type, parent) {
  if(utils.isSubclass(type, Model)) {
    //we set defaults later, when we have a full data object
    return new type(undefined, {parent: parent, doNotSetDefaults: true});
  } else {
    return new type(descriptor, parent || this);
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
      data[prop] = this._instantiateType(schema[prop], typedSchema[prop], this.parent || this);
    }
  }
  return data;
};

/**
 * Force all the Fields in the data to set their default value
 */
Model.prototype.setDefault = function() {
  for(var prop in this.data) {
    if(this.data.hasOwnProperty(prop)) {
      this.data[prop].setDefault();
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
  var self = this;
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
    return self.data[paths[0]] && self.data[paths[0]][method](paths.slice(1).join('.'));
  } else {
    return self.data[path] && self.data[path][method]();
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
  var self = this;
  if(!path) {
    return;
  }

  if(typeof path == 'string') {
    var paths = path.split('.');
    if(paths.length > 1) {
      //is another model
      self.data[paths[0]] && self.data[paths[0]][method](paths.slice(1).join('.'), val);
    } else {
      self.data[path] && self.data[path][method](val);
    }
  } else {
    val = path;
    for(var prop in val) {
      if(val.hasOwnProperty(prop)) {
        self[method](prop, val[prop]);
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

  for(var key in this.data) {
    if(this.data.hasOwnProperty(key)) {
      var field = this.data[key];
      if(where === "all" || !field.inView || field.inView(where)) {
        if(bound) {
          utils.defineProperty(obj, this, key);
        } else {
          obj[key] = field._export(where, bound);
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
