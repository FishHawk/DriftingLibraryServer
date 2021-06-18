import settings from '@settings';

import { ProviderAdapter } from './adapter';
import ProviderBilibili from './bilibili';
import ProviderDmzj from './dmzj';
import ProviderManhuaren from './manhuaren';

export class ProviderManager {
  readonly providers: Record<string, ProviderAdapter> = {};

  constructor() {
    this.registerProvider(new ProviderDmzj());
    this.registerProvider(new ProviderManhuaren());

    const providerBilibili = new ProviderBilibili();
    if (settings.bilibiliCookie)
      providerBilibili.setCookie(settings.bilibiliCookie);
    this.registerProvider(providerBilibili);
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
