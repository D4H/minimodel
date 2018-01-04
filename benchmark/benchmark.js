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
  nested3: minimodel.Types.Any,
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
  .add('exportDeep', {
    beforeAll: function() {
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
        nexted3: {
          nested31: {
            nested311: 'test'
          },
          nestedModel: new Model({
            id: '1',
            title: '2',
            nested: {
              type: '3',
              hello: '4'
            },
            nexted3: [
              {
                nested311: 'test'
              },
              {
                nested311: 'test'
              }
            ]
          })
        },
        asField: 'asdfadsfadsf'
      }, {defineProperties: false})
    },
    fn: function() {
      minimodel.exportDeep({
        model,
        arr: [model, model, model, model, model, model, model, model, model, model, model, model, model]
      })
    },
    iterations: 50000
  })
  .run();
