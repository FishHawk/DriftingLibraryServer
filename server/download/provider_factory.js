import manhuadui from './providers/manhuadui.js';

const providers = {
  manhuadui,
};

function getAllProviderName() {
  return Object.keys(providers);
}

function getProvider(name) {
  return name in providers ? providers[name] : null;
}

export default {
  getAllProviderName,
  getProvider,
};
