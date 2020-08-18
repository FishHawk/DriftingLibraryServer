import { ProviderAdapter, ProviderInfo } from './provider_adapter';
import MangaProviderManhuaren from './providers/manhuaren';

export class ProviderRegistry {
  readonly providers: Record<string, ProviderAdapter> = {};

  constructor() {
    this.registerProvider(new MangaProviderManhuaren());
  }

  private registerProvider(provider: ProviderAdapter) {
    this.providers[provider.name] = provider;
  }

  getProvider(name: string): ProviderAdapter | undefined {
    return name in this.providers ? this.providers[name] : undefined;
  }

  getProviderInfoList(): ProviderInfo[] {
    return Object.values(this.providers).map((p) => p.getInfo());
  }
}
