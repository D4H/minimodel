var foreach = require('lodash.foreach');
var inherits = require('inherits');
  
function ValidationError(type, params) {
  if(!this instanceof ValidationError) return new ValidationError(type, params);
  
  this.type = type || 'generic';
  this.params = params;
  this.message = ValidationError.getMessage(type, params);
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ValidationError);
  }
}
inherits(ValidationError, Error);
module.exports = ValidationError;

  module.exports.messages = {
  "en-us": {
    "generic": "Failed to validate field",
    "required": "The field is required",
    "wrong_type": "Field value is not of type ${type}"
  }
};

ValidationError.getMessage = function(type, params, lang) {
  lang = lang || "en-us";
  return ValidationError.messages[lang][type].replace(/\${([\w]+)}/g, function (match, varname) {
    return params[varname];
  });
};

ValidationError.append = function(existingErrs, parentProp, errs) {
  if(Array.isArray(errs) || errs instanceof Error) {
    existingErrs[parentProp] = errs;
    return;
  }
  
  foreach(errs, function(err, prop) {
    existingErrs[parentProp + '.' + prop] = err;
  });
};

function ValidationErrorCollection(errors) {
  this.errors = errors;
  var message = 'Validation Errors: \n';
  foreach(errors, function(err, prop) {
    message += prop + ':' +err.message + '\n';
  });
  this.message = message;
  
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, ValidationErrorCollection);
  }
}
inherits(ValidationErrorCollection, Error);

ValidationError.Collection = ValidationErrorCollection;