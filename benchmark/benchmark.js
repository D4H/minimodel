var Benchpress = require('benchpress');
var suite = new Benchpress()

var minimodel = require('../lib')

var Model = minimodel.Model.extend({
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
})

var model

suite
  .add('Create model', {
    fn: function() {
      model = new Model({
        id: 'asdfasdfasdfasdf',
        title: 'asfdasdfasdf',
        nested: {
          type: 'asdsfasdf',
          hello: 'qsdfff'
        },
        nested2: {
          me: 'asdfasdf',
          hellp: 'fasdfadsf'
        },
        asField: 'asdfadsfadsf'
      })
    },
    iterations: 50000
  })
  .add('Create model (defineProperties = false)', {
    fn: function() {
      model = new Model({
        id: 'asdfasdfasdfasdf',
        title: 'asfdasdfasdf',
        nested: {
          type: 'asdsfasdf',
          hello: 'qsdfff'
        },
        nested2: {
          me: 'asdfasdf',
          hellp: 'fasdfadsf'
        },
        asField: 'asdfadsfadsf'
      }, {defineProperties: false})
    },
    iterations: 50000
  })
  .add('toJson', {
    fn: function() {
      model.toJson()
    },
    iterations: 50000
  })
  .run();