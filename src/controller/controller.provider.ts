import { Response } from 'express';

import { ProviderManager } from '../provider/manager';

import { Controller } from './decorator/controller';
import { Res, Param, Query } from './decorator/parameter';
import { Get } from './decorator/verb';
import { assertExist } from './exception';

@Controller('/providers')
export class ProviderController {
  constructor(private readonly providerManager: ProviderManager) {}

  @Get('/')
  listProvider(@Res() res: Response) {
    const providers = this.providerManager
      .getProviderList()
      .map((provider) => provider.getInfo());
    return res.json(providers);
  }

  @Get('/:providerId')
  getProvider(@Res() res: Response, @Param('providerId') providerId: string) {
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const providerDetail = provider.getDetail();
    return res.json(providerDetail);
  }

  @Get('/:providerId/icon')
  getProviderIcon(
    @Res() res: Response,
    @Param('providerId') providerId: string
  ) {
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const icon = provider.getIcon();
    assertExist(icon, 'icon');
    return icon.pipe(res.type(icon.mime));
  }

  @Get('/:providerId/popular')
  async listPopularManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @Query() option: any
  ) {
    for (const key in option) {
      option[key] = Number.parseInt(option[key]);
    }
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const mangas = await provider.requestPopular(page, option);
    assertExist(mangas, 'popular mangas');
    return res.json(mangas);
  }

  @Get('/:providerId/latest')
  async listLatestManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @Query() option: any
  ) {
    for (const key in option) {
      option[key] = Number.parseInt(option[key]);
    }
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const mangas = await provider.requestLatest(page, option);
    assertExist(mangas, 'latest mangas');
    return res.json(mangas);
  }

  @Get('/:providerId/category')
  async listCategoryManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @Query() option: any
  ) {
    for (const key in option) {
      option[key] = Number.parseInt(option[key]);
    }
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const mangas = await provider.requestCategory(page, option);
    assertExist(mangas, 'category mangas');
    return res.json(mangas);
  }

  @Get('/:providerId/mangas')
  async listManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('keywords') keywords: string,
    @Query('page') page: number
  ) {
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const mangas = await provider.search(page, keywords);
    return res.json(mangas);
  }

  @Get('/:providerId/mangas/:mangaId')
  async getManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string
  ) {
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const manga = await provider.requestMangaDetail(mangaId);
    return res.json(manga);
  }

  @Get('/:providerId/mangas/:mangaId/chapters/:chapterId')
  async getChapter(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string,
    @Param('chapterId') chapterId: string
  ) {
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const chapter = await provider.requestChapterContent(mangaId, chapterId);
    return res.json(chapter);
  }

  @Get('/:providerId/images/:url')
  async getImage(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('url') url: string
  ) {
    const provider = this.providerManager.getProvider(providerId);
    assertExist(provider, 'provider');
    const image = await provider.requestImage(url);
    if (image.contentLength != 0)
      res.set({ 'Content-Length': image.contentLength });
    return image.pipe(res.type(image.mime));
  }
}
