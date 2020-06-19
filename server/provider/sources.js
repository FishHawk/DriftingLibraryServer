import manhuaren from './source/manhuaren.js';

const sourceRegistry = {};

function registerSource(source) {
  sourceRegistry[source.name] = source;
}
registerSource(manhuaren);

function getAllSource() {
  return Object.values(sourceRegistry);
}

function getSource(name) {
  return name in sourceRegistry ? sourceRegistry[name] : undefined;
}

export default {
  getAllSource,
  getSource,
};
