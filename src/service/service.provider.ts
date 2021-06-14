import { NotFoundError } from '../controller/exception';
import { ProviderManager } from '../provider/manager';

export class ProviderService {
  constructor(private readonly providerManager: ProviderManager) {}

  listProvider() {
    const providers = this.providerManager
      .getProviderList()
      .map((provider) => provider.getInfo());
    return providers;
  }

  getProvider(providerId: string) {
    const provider = this.assureProvider(providerId);
    const providerDetail = provider.getDetail();
    return providerDetail;
  }

  getProviderIcon(providerId: string) {
    const provider = this.assureProvider(providerId);
    const icon = provider.getIcon();
    if (icon === undefined)
      throw new NotFoundError(`Provider:${providerId} icon not found`);
    return icon;
  }

  async listPopularManga(providerId: string, page: number, option: any) {
    for (const key in option) {
      option[key] = Number.parseInt(option[key]);
    }
    const provider = this.assureProvider(providerId);
    const mangas = await provider.requestPopular(page, option);
    if (mangas === undefined)
      throw new NotFoundError(`Provider:${providerId} popular manga not found`);
    return mangas;
  }

  async listLatestManga(providerId: string, page: number, option: any) {
    for (const key in option) {
      option[key] = Number.parseInt(option[key]);
    }
    const provider = this.assureProvider(providerId);
    const mangas = await provider.requestLatest(page, option);
    if (mangas === undefined)
      throw new NotFoundError(`Provider:${providerId} latest manga not found`);
    return mangas;
  }

  async listCategoryManga(providerId: string, page: number, option: any) {
    for (const key in option) {
      option[key] = Number.parseInt(option[key]);
    }
    const provider = this.assureProvider(providerId);
    const mangas = await provider.requestCategory(page, option);
    if (mangas === undefined)
      throw new NotFoundError(
        `Provider:${providerId} category manga not found`
      );
    return mangas;
  }

  async listManga(providerId: string, keywords: string, page: number) {
    const provider = this.assureProvider(providerId);
    return await provider.search(page, keywords);
  }

  async getManga(providerId: string, mangaId: string) {
    const provider = this.assureProvider(providerId);
    return await provider.requestMangaDetail(mangaId);
  }

  async getChapter(providerId: string, mangaId: string, chapterId: string) {
    const provider = this.assureProvider(providerId);
    return await provider.requestChapterContent(mangaId, chapterId);
  }

  async getImage(providerId: string, url: string) {
    const provider = this.assureProvider(providerId);
    return await provider.requestImage(url);
  }

  private assureProvider(providerId: string) {
    const provider = this.providerManager.getProvider(providerId);
    if (provider === undefined)
      throw new NotFoundError(`Provider:${providerId} not found`);
    return provider;
  }
}
