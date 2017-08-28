var Model = require('./Model');
var schemaParser = require('./schemaParser');
var inherits = require('inherits');
var merge = require('lodash/merge');
var utils = require('./utils');
var modelsRegistry  = require('./modelsRegistry');

var self = module.exports;

function defaultArgsMapper() {
  return arguments;
}


function extendModel(name, schema, extendOptions) {
  var Parent = this;
  if(!utils.isString(name)) {
    schema = name;
    name = undefined;
    extendOptions = schema;
  }
  
  if(name && modelsRegistry.find(name)) {
    throw new Error('Cannot redefine existing model with name: ' + name);
  }
  
  extendOptions = utils.defaults({}, extendOptions, {
    schemaParser: Parent.__schemaParser || schemaParser,
    extendArgsMapper: Parent.__extendArgsMapper || defaultArgsMapper
  });
  
  var ExtendedModel = new Function("init", 
    "return function " + (name || 'Model') + "(){ init.apply(this, arguments) };")(
    function() {
      var args = extendOptions.extendArgsMapper.apply(null, arguments);
      var obj = args[0];
      var options = args[1];
      return initialize.call(this, obj, options);
    }
  );

  function initialize(obj, options) {
    //TODO: how to pass those args dynamically?
    if (!(this instanceof ExtendedModel))
      return new ExtendedModel(obj, options);

    this.Class = ExtendedModel;
    Parent.__initialize.call(this, obj, utils.defaults({}, options, {
      schemas: ExtendedModel.__schemas,
      schemaParser: ExtendedModel.schemaParser
    }));
  }
  
  if(name) {
    modelsRegistry.set(name, ExtendedModel);
    if(extendOptions.alias) {
      modelsRegistry.set(extendOptions.alias, ExtendedModel);
    }
  }
  
  //for Proto
  inherits(ExtendedModel, Parent);
  //for static
  utils.assign(ExtendedModel, Parent);

  var parsedSchema = extendOptions.schemaParser.parseSchema(schema).normalized;
  ExtendedModel.__schemas = extendOptions.schemaParser.parseSchema(merge({}, Parent.__schemas.normalized, parsedSchema));
  ExtendedModel.__schemaParser = extendOptions.schemaParser;
  ExtendedModel.__extendArgsMapper = extendOptions.extendArgsMapper;
  
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
self.registry = modelsRegistry; 

self.Types = {
  String: require('./fields/StringField'),
  Number: require('./fields/NumberField'),
  Boolean: require('./fields/BooleanField'),
  Date: require('./fields/DateField'),
  Array: require('./fields/ArrayField'),
  Virtual: require('./fields/VirtualField'),
  Constant: require('./fields/ConstantField'),
  Any: require('./fields/Field')
};

self.exportDeep = utils.exportDeep;
self.Errors = require('./errors');
