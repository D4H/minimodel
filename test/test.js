
var expect = require('chai').expect,
  minimodel = require('../lib');


describe('set/get/cast', function() {
  var Post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      id: String,
      title: {
        type: String
      },
      nested: {
        type: {
          type: String
        },
        hello: String
      },
      nested2: {
        me: String,
        hello: String
      },
      asField: minimodel.Types.String
    });
  });


  it('should set/get a property from constructor', function() {
    var post = new Post({id: "blah"});
    expect(post.get('id')).to.be.equal('blah');
  });

  it('should set a property', function() {
    var post = new Post();
    post.set('id', "blah");
    expect(post.get('id')).to.be.equal('blah');
  });

  it('should cast a value to its actual type (generic test)', function() {
    var post = new Post({id: {}});
    expect(post.get('id')).to.be.equal('[object Object]');
  });

  it('should support nested properties', function() {
    var post = new Post({id: "blah", nested2: {me: "test", hello: "world"}});
    expect(post.get('nested2.me')).to.be.equal('test');
    expect(post.get('nested2.hello')).to.be.equal('world');
  });
  
  it('should support nested "type" property', function() {
    var post = new Post({id: "blah", nested: {type: "test", hello: "world"}});
    expect(post.get('nested.type')).to.be.equal('test');
    expect(post.get('nested.hello')).to.be.equal('world');
  });

  it('should retrieve entire nested objects', function() {
    var post = new Post({nested: {type: "test"}});
    expect(post.get('nested')).to.have.property('type', 'test');
  });

  it('should not set properties not in schema', function() {
    var post = new Post({id: "blah", type: "test"});
    expect(post.get('type')).to.not.exist;
  });

  it('should support Model/Fields as types', function() {
    var post = new Post({asField: 1});
    expect(post.get('asField')).to.be.equal('1');
  });
});


describe('handling wrong descriptors', function() {
  it('should throw exception for empty object', function() {
    expect(function() {
      minimodel.Model.extend({
        id: {}
      });
    }).to.throw(/Invalid field/);
  });

  it('should throw exception for undefined', function() {
    expect(function() {
      minimodel.Model.extend({
        id: undefined
      });
    }).to.throw(/Invalid field/);
  });

  it('should throw exception for undefined type', function() {
    expect(function() {
      minimodel.Model.extend({
        id: {
          type: undefined
        }
      });
    }).to.throw(/Invalid field/);
  });


  it('should throw exception for nested empty types', function() {
    expect(function() {
      minimodel.Model.extend({
        id: {
          type: {
            type: {
              type: {}
            }
          }
        }
      });
    }).to.throw(/Invalid field/);
  });
});



describe('field getters/setters', function() {

  it('should use the field getter to retrieve field value', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        get: function() {
          return this.getRaw() + "!"
        }
      }
    });

    var model = new TestModel();
    model.set('id', "ok");
    expect(model.get('id')).to.be.equal('ok!');
  });


  it('should use the field setter to set field value', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        set: function(val) {
          return this.setRaw(val + "!");
        }
      }
    });

    var model = new TestModel();
    model.set('id', "ok");
    expect(model.get('id')).to.be.equal('ok!');
  });
});


describe('Virtuals', function() {
  it('should not have default getters and setters', function() {
    var TestModel = minimodel.Model.extend({
      field: {
        type: minimodel.Types.Virtual
      }
    });

    var model = new TestModel();
    model.set('field', "ok");
    expect(model.get('field')).to.not.exist;
  });


  it('getters/setters should be able to access main model', function() {
    var TestModel = minimodel.Model.extend({
      full: {
        type: minimodel.Types.Virtual,
        get: function() {
          return this.model.get('name') + " " + this.model.get('surname');
        }
      },
      nested: {
        prop: {
          type: minimodel.Types.Virtual,
          get: function() {
            return this.model.get('name') + " " + this.model.get('surname');
          }
        }
      },
      name: String,
      surname: String
    });

    var model = new TestModel({name: "John", surname: "Doe"});
    expect(model.get('full')).to.be.equal('John Doe');
    expect(model.get('nested.prop')).to.be.equal('John Doe');
  });


  it('should not be exported', function() {
    var TestModel = minimodel.Model.extend({
      field: {
        type: minimodel.Types.Virtual,
        get: function() {
          return "ok";
        }
      }
    });

    var model = new TestModel();
    expect(model.toObject()).to.be.empty;
  });
});


describe('access using properties', function() {
  var Post, post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      title: {
        type: String
      },
      nested: {
        type: {
          type: String
        }
      },
    });
    post = new Post({title: "blah", nested: {type: "test"}});
  });


  it('should get the value using property accessor', function() {
    expect(post.title).to.be.equal('blah');
  });
  
  it('should set the value using property accessor', function() {
    post.title = 'blah+';
    expect(post.title).to.be.equal('blah+');
  });
  
  it('should get the value of nested fields using property accessor', function() {
    expect(post.nested.type).to.be.equal('test');
  });
  
  it('should set the value of nested fields using property accessor', function() {
    post.nested.type = 'test+';
    expect(post.nested.type).to.be.equal('test+');
  });
  
  it('should set entire nested objects', function() {
    post.nested = {type: 'test+'};
    expect(post.nested.type).to.be.equal('test+');
  });
});


describe('defaults', function() {
  var Post, post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      title: {
        type: String
      },
      nested: {
        type: {
          type: String,
          default: "ahahah"
        }
      },
      aField: {
        type: String,
        default: "mmm"
      },
      anotherField: {
        type: String,
        default: "mmm"
      }
    });
    post = new Post({title: "blah", anotherField: "wha"});
  });


  it('should set default value if not specified in constructor', function() {
    expect(post.aField).to.be.equal('mmm');
    expect(post.nested.type).to.be.equal('ahahah');
  });
  
  it('should not set default value if it is specified in constructor', function() {
    expect(post.title).to.be.equal('blah');
    expect(post.anotherField).to.be.equal('wha');
  });
});


describe('Date field', function() {
  var Post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      date: Date
    });
  });
  
  it('should set date from string', function() {
    var post = new Post({date: "1382354005"});
    expect(post.date).to.be.instanceof(Date);
    expect(post.date.toString()).to.be.equal("Fri Jan 16 1970 23:59:14 GMT+0000 (GMT)");
  });
  
  it('should set date from number', function() {
    var post = new Post({date: 1382354005});
    expect(post.date).to.be.instanceof(Date);
    expect(post.date.toString()).to.be.equal("Fri Jan 16 1970 23:59:14 GMT+0000 (GMT)");
  });
});


describe('Number field', function() {
  var Post;

  beforeEach(function() {
    Post = minimodel.Model.extend({
      nr: Number
    });
  });
  
  it('should set number from string', function() {
    var post = new Post({nr: "7"});
    expect(typeof post.nr === 'number');
    expect(post.nr).to.be.equal(7);
  });
  
  it('should set number from number', function() {
    var post = new Post({nr: 7});
    expect(typeof post.nr === 'number');
    expect(post.nr).to.be.equal(7);
  });
});

describe('Validators', function() {
  it('should not validate if empty value and required is set', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        required: true
      }
    });
    
    var model = new TestModel({});
    expect(model.id).to.not.exist;
    expect(model.validate()).to.be.instanceof(minimodel.Errors.ModelValidationError);
    expect(model.validate()).to.have.deep.property("errors.id.type", "required");
  });
  
  
  it('should not validate if empty string and required is set', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        required: true
      }
    });
    
    var model = new TestModel({id: ""});
    expect(model.validate()).to.have.deep.property("errors.id.type", "required");
  });
  
  
  it('should not validate if date is not valid date', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: Date
      }
    });
    
    var model = new TestModel({id: "asdqweasd"});
    expect(model.validate()).to.have.deep.property("errors.id.type", "wrong_type");
  });
  
  
  it('should not validate if custom validation fail', function() {
    var TestModel = minimodel.Model.extend({
      id: {
        type: String,
        validate: function() {
          if(this.value.length < 2) {
            return new Error("Custom validation failed");
          }
        }
      }
    });
    
    var model = new TestModel({id: "a"});
    expect(model.validate()).to.have.deep.property("errors.id");
  });
});
