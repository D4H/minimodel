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
      enumerable: true
    });
  },

  defaults: function() {
    var target = arguments[0]
    var obj2
    for(var i = 1; i < arguments.length; i++) {
      obj2 = arguments[i] || {}
      for(var prop in obj2) {
        if(obj2.hasOwnProperty(prop) &&
          obj2[prop] !== void 0 &&
          target[prop] === void 0) {
          target[prop] = obj2[prop]
        }
      }
    }

    return target
  },

  assign: function() {
    var target = arguments[0]
    var obj2
    for(var i = 1; i < arguments.length; i++) {
      obj2 = arguments[i] || {}
      for(var prop in obj2) {
        if(obj2.hasOwnProperty(prop)) {
          target[prop] = obj2[prop]
        }
      }
    }

    return target
  },

  omit: function(origin) {
    var res = {}
    var found
    for(var prop in origin) {
      if(origin.hasOwnProperty(prop)) {
        found = false
        for(var i = 1; i < arguments.length; i++) {
          if(arguments[i] === prop) {
            found = true
            break
          }
        }
        if(!found) {
          res[prop] = origin[prop]
        }
      }
    }

    return res
  },

  //modified version taken from latest version of https://github.com/lodash/lodash/blob/master/isPlainObject.js#b36f21cbaff7c885223b44267c70e6711b754af6
  //which is faster than the one currently in npm 4.17.4
  isPlainObject: function isPlainObject(value) {
    if (!((typeof value == 'object' && value !== null)) || Object.prototype.toString(value) != '[object Object]') {
      return false
    }
    if (Object.getPrototypeOf(value) === null) {
      return true
    }
    var proto = value
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto)
    }
    return Object.getPrototypeOf(value) === proto
  },

  exportDeep: function(obj, options) {
    var view = (options && options.view) || 'object'
    var ret

    if(obj && obj.toJson && obj.toView) {
      return obj.toView(view);
    }

    if(Array.isArray(obj)) {
      ret = (options && options.inPlace) ? obj : []
      for(var i = 0; i < obj.length; i++) {
        ret[i] = self.exportDeep(obj[i], options)
      }
      return ret
    }

    if(self.isPlainObject(obj)) {
      ret = (options && options.inPlace) ? obj : {}
      var keys = Object.keys(obj)
      for(var i = 0; i < keys.length; i++) {
        var key = keys[i]
        ret[key] = self.exportDeep(obj[key], options)
      }
      return ret
    }

    //non compatible object return as it is
    return obj
  }
};
