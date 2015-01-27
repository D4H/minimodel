

function ModelsRegistry() {
  this.models = {};
}


ModelsRegistry.prototype.find = function(name) {
  return this.models[name];
};


ModelsRegistry.prototype.set = function(name, model) {
  this.models[name] = model;
};

module.exports = new ModelsRegistry();
module.exports.ModelsRegistry = ModelsRegistry;
