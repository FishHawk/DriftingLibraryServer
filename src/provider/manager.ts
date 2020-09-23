import {
  ProviderAdapter,
  ProviderDetail,
  ProviderInfo,
} from './providers/adapter';
import ProviderBilibili from './providers/bilibili';
import ProviderDmzj from './providers/dmzj';
import ProviderManhuaren from './providers/manhuaren';

export class ProviderManager {
  readonly providers: Record<string, ProviderAdapter> = {};

  constructor() {
    this.registerProvider(new ProviderBilibili());
    this.registerProvider(new ProviderDmzj());
    this.registerProvider(new ProviderManhuaren());
  }

  protected registerProvider(provider: ProviderAdapter) {
    this.providers[provider.id] = provider;
  }

  getProvider(id: string): ProviderAdapter | undefined {
    return id in this.providers ? this.providers[id] : undefined;
  }

  getProviderList() {
    return Object.values(this.providers);
  }
}
