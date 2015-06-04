var Model = require('./Model');
var utils = require('./utils');
var Field = require('./fields/Field');

function SchemaParser(fields) {
  this.fields = fields || [
    require('./fields/BooleanField'),
    require('./fields/StringField'),
    require('./fields/NumberField'),
    require('./fields/DateField'),
    require('./fields/ConstantField'),
    require('./fields/ArrayField')
  ];
}

/**
* Transform a schema descriptor to a schema having Fields and Models as properties.
*
* @param schema
* @returns {{normalized: {}, typed: {}}}
*/
SchemaParser.prototype.parseSchema = function(schema) {
  //parse the schema
  var schemas = {
    normalized: {},
    typed: {}
  };

  for(var prop in schema) {
    if(schema.hasOwnProperty(prop)) {
      var parsedField = this.parseField(schema[prop]);
      if(!parsedField) {
        throw new Error("Invalid field type for: " + prop + '. Type: ' + schema[prop]);
      }
      schemas.normalized[prop] = parsedField.normalized;
      schemas.typed[prop] = parsedField.typed;
    }
  }
  return schemas;
};

/**
* Given a normalized descriptor, it returns the proper Field class for the specified type, undefined otherwise.
* @param descriptor
* @returns {*}
* @private
*/
SchemaParser.prototype.getField = function(descriptor) {
  if(!descriptor || !descriptor.type) {
    return undefined;
  }

  for(var i = 0; i < this.fields.length; i++) {
    var type = this.fields[i];
    if(type.isTypeOf(descriptor)) {
      return type;
    }
  }
  return undefined;
};


SchemaParser.prototype.alreadyAnInstance = function(type) {
  return utils.isSubclass(type, Field) ||
    utils.isSubclass(type, Model);
};

/**
* Given an name and a field descriptor, it returns an object in the form {typed: <>, normalized: <>}
* where "typed" is the actual parsed Field, and "normalized" is the normalized descriptor in the form {type: <>, ...}
*
* @param desc
* @returns {{}}
* @private
*/
SchemaParser.prototype.parseField = function(desc) {
  var field;
  var container = {};
  if(this.alreadyAnInstance(desc)) {
    container.typed = desc;
    container.normalized = {type: desc};
    return container;
  }

  if(desc && (this.alreadyAnInstance(desc.type))) {
    container.typed = desc.type;
    container.normalized = desc;
    return container;
  }

  field = this.getField({type: desc});
  if(field) {
    container.typed = field;
    container.normalized = {type: desc};
    return container;
  }

  field = desc && this.getField(desc);
  if(field) {
    container.typed = field;
    container.normalized = desc;
    return container;
  }

  //it's a nested object?
  if(!utils.isEmpty(desc) && ! utils.isString(desc)) {
    container.typed = Model.extend(desc);
    container.normalized = desc;
    return container;
  }

  return undefined;
};

module.exports = new SchemaParser();
module.exports.SchemaParser = SchemaParser;
