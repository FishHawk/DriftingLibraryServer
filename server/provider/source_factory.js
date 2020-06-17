import manhuadui from './source/manhuadui.js';

const source = {
  manhuadui,
};

function getAllSourceName() {
  return Object.keys(source);
}

function getSource(name) {
  return name in source ? source[name] : null;
}

export default {
  getAllSourceName,
  getSource,
};
