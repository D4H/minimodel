var Model = require('./Model');
var schemaParser = require('./schemaParser');
var inherits = require('inherits');
var merge = require('lodash.merge');
var assign = require('lodash.assign');
var defaults = require('lodash.defaults');

var self = module.exports;

function extendModel(schema, extendOptions) {
  var Parent = this;
  
  extendOptions = defaults({}, extendOptions, {
    schemaParser: schemaParser
  });

  var ExtendedModel = function(obj, options) {
    if (!(this instanceof ExtendedModel))
      return new ExtendedModel(obj, options);
    
    Parent.call(this, obj, defaults({}, options, {
      schemas: ExtendedModel.__schemas,
      schemaParser: extendOptions.schemaParser
    }));
  };
  
  //for Proto
  inherits(ExtendedModel, Parent);
  //for static
  assign(ExtendedModel, Parent);

  var parsedSchema = extendOptions.schemaParser.parseSchema(schema).normalized;
  ExtendedModel.__schemas = extendOptions.schemaParser.parseSchema(merge({}, Parent.__schemas.normalized, parsedSchema));
  ExtendedModel.__schemaParser = extendOptions.schemaParser;
  /**
  * Define a property programmatically
  *
  * @param name
  * @param descriptor
  */
  ExtendedModel.property = function(name, descriptor) {
    var propPath = name.split('.');
    if(propPath.length > 1) {
      this.__schemas.typed[propPath[0]].property(propPath.slice(1).join("."), descriptor);
    } else {
      var parsedField = this.__schemaParser.parseField(descriptor);

      this.__schemas.normalized[name] = parsedField.normalized;
      this.__schemas.typed[name] = parsedField.typed;
    }
  };
  ExtendedModel.extend = extendModel;

  return ExtendedModel;
}

Model.__schemaParser = schemaParser;
Model.extend = extendModel;
self.Model = Model;
self.Collection = require('./Collection');

self.Types = {
  String: require('./fields/StringField'),
  Number: require('./fields/NumberField'),
  Boolean: require('./fields/BooleanField'),
  Date: require('./fields/DateField'),
  Array: require('./fields/ArrayField'),
  Virtual: require('./fields/VirtualField'),
  Any: require('./fields/Field')
};

self.Errors = require('./errors');
