import { ProviderAdapter, ProviderInfo } from '../provider/provider_adapter';
import ProviderManhuaren from '../provider/providers/manhuaren';

export class ProviderService {
  readonly providers: Record<string, ProviderAdapter> = {};

  constructor() {
    this.registerProvider(new ProviderManhuaren());
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
