import { MangaProvider, MangaProviderInfo } from './provider';
import MangaProviderManhuaren from './providers/manhuaren';

const providersRegistry: Record<string, MangaProvider> = {};

function registerProvider(provider: MangaProvider) {
  providersRegistry[provider.name] = provider;
}

registerProvider(new MangaProviderManhuaren());

export function getProvidersInfo(): MangaProviderInfo[] {
  return Object.values(providersRegistry).map((x) => x.getInfo());
}

export function getProvider(name: string): MangaProvider | undefined {
  return name in providersRegistry ? providersRegistry[name] : undefined;
}
