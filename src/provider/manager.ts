import path from 'path';

import * as fsu from '../util/fs';

import { ProviderAdapter } from './providers/adapter';
import ProviderBilibili from './providers/bilibili';
import ProviderDmzj from './providers/dmzj';
import ProviderManhuaren from './providers/manhuaren';

export class ProviderManager {
  readonly providers: Record<string, ProviderAdapter> = {};

  static async createInstance(libraryDir: string) {
    return new ProviderManager(libraryDir).initialize();
  }

  private constructor(private readonly libraryDir: string) {}

  private async initialize() {
    this.registerProvider(new ProviderBilibili());
    this.registerProvider(new ProviderDmzj());
    this.registerProvider(new ProviderManhuaren());

    const configFilepath = path.join(this.libraryDir, 'provider.json');
    const config = await fsu.readJSON(configFilepath);

    if (typeof config === 'object') {
      for (const provider of this.getProviderList()) {
        const providerConfig = config[provider.id];
        if (typeof providerConfig === 'object') {
          provider.applyConfig(providerConfig);
        }
      }
    }
    return this;
  }

  private registerProvider(provider: ProviderAdapter) {
    this.providers[provider.id] = provider;
  }

  getProvider(id: string): ProviderAdapter | undefined {
    return id in this.providers ? this.providers[id] : undefined;
  }

  getProviderList() {
    return Object.values(this.providers);
  }
}
