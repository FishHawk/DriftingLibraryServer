import manhuaren from './source/manhuaren.js';

const sourceRegistry = {};

function registerSource(source) {
  sourceRegistry[source.name] = source;
}
registerSource(manhuaren);

export function getAllSource() {
  return Object.values(sourceRegistry);
}

export function getSource(name) {
  return name in sourceRegistry ? sourceRegistry[name] : undefined;
}
