var isPlainObject = require('lodash.isplainobject')
var forEach = require('lodash.foreach')

var self = module.exports = {
  isNumber: function(value) {
    return typeof value == 'number' || Object.prototype.toString.call(value) == "[object Number]";
  },

  isFunction: function(value) {
    return typeof value == 'function';
  },

  isString: function(obj) {
    return typeof obj == 'string' || Object.prototype.toString.call(obj) == "[object String]";
  },

  isArray: function(obj) {
    return typeof obj == 'object' && typeof obj.length == 'number' &&
      Object.prototype.toString.call(obj) == '[object Array]';
  },

  isEmpty: function(value) {
    if(!value) {
      return true;
    }
    if(self.isArray(value) && value.length === 0) {
      return true;
    } if(self.isFunction(value)) {
      return false;
    } else {
      for(var i in value) {
        if(Object.prototype.hasOwnProperty.call(value, i)) {
          return false;
        }
      }
      return true;
    }
  },

  isSubclass: function(clazz, superclazz) {
    return clazz && (clazz === superclazz || clazz.prototype instanceof superclazz);
  },

  bind: function(func, context, args) {
    args = args || [];
    return function() {
      return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
    };
  },

  getValue: function(funcOrVal, context) {
    if(self.isFunction(funcOrVal)) {
      return funcOrVal.call(context);
    }

    return funcOrVal;
  },

  defineProperty: function(target, context, prop) {
    Object.defineProperty(target, prop, {
      get: function() {
        return context.get(prop);
      },
      set: function(val) {
        return context.set(prop, val);
      },
      enumerable : true
    });
  },


  exportDeep: function(obj, options) {
    var view = (options && options.view) || 'object'
    var ret
    
    if(obj && obj.toJson && obj.toView) {
      return obj.toView(view);
    } 
    
    if(isPlainObject(obj) || Array.isArray(obj)) {
      ret = (options && options.inPlace) ? obj : (Array.isArray(obj) ? [] : {})
      forEach(obj, function(val, k) {
        ret[k] = self.exportDeep(val, options)
      })
      return ret
    }
    
    //non compatible object return as it is
    return obj
  }
};
