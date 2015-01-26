var foreach = require('lodash.foreach');

var self = module.exports = function ValidationError(type, params) {
  if(!this instanceof ValidationError) return new ValidationError(type, params);
  
  this.type = type || 'generic';
  this.params = params;
  this.message = self.getMessage(type, params);
};


module.exports.messages = {
  "en-us": {
    "generic": "Failed to validate field",
    "required": "The field is required",
    "wrong_type": "Field value is not of type ${type}"
  }
};

module.exports.getMessage = function(type, params, lang) {
  lang = lang || "en-us";
  return self.messages[lang][type].replace(/\${([\w]+)}/g, function (match, varname) {
    return params[varname];
  });
};

module.exports.append = function(existingErrs, parentProp, errs) {
  if(Array.isArray(errs)) {
    existingErrs[parentProp] = errs;
    return;
  }
  
  foreach(errs, function(err, prop) {
    existingErrs[parentProp + '.' + prop] = err;
  });
};