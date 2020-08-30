import { ProviderAdapter, ProviderInfo } from './adapter';
import ProviderManhuaren from './providers/manhuaren';

export class ProviderManager {
  readonly providers: Record<string, ProviderAdapter> = {};

  constructor() {
    this.registerProvider(new ProviderManhuaren());
  }

  private registerProvider(provider: ProviderAdapter) {
    this.providers[provider.name] = provider;
  }

  getProvider(id: string): ProviderAdapter | undefined {
    return id in this.providers ? this.providers[id] : undefined;
  }

  getProviderInfoList(): ProviderInfo[] {
    return Object.values(this.providers).map((p) => p.getInfo());
  }
}
