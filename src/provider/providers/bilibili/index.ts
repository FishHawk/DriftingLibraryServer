import axios from 'axios';

import * as Entity from '../../../library/entity';
import { ProviderAdapter } from '../../adapter';
import { parseMangaOutlines, parseMangaDetail, parseChapterContent } from './parse';

export default class Provider extends ProviderAdapter {
  readonly lang: string = 'zh';
  readonly name: string = '哔哩哔哩漫画';
  readonly isLatestSupport: boolean = true;

  private readonly pageSize = 20;
  private readonly baseUrl = 'https://manga.bilibili.com/';
  private readonly instance = axios.create({
    baseURL: this.baseUrl,
    timeout: 5000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/65.0.3325.146 Safari/537.36',
    },
  });

  search(page: number, keywords: string): Promise<Entity.MangaOutline[]> {
    return this.instance
      .post('/twirp/comic.v1.Comic/Search?device=pc&platform=web', {
        key_word: keywords,
        page_num: page,
        page_size: this.pageSize,
      })
      .then((res) => parseMangaOutlines(res.data));
  }

  requestPopular(page: number): Promise<Entity.MangaOutline[]> {
    throw new Error('Method not implemented.');
  }

  requestLatest(page: number): Promise<Entity.MangaOutline[]> {
    throw new Error('Method not implemented.');
  }

  requestMangaDetail(id: string): Promise<Entity.MangaDetail> {
    return this.instance
      .post('/twirp/comic.v1.Comic/ComicDetail?device=h5&platform=h5', { comic_id: id })
      .then((res) => parseMangaDetail(res.data.data))
      .then((detail) => {
        detail.providerId = this.name;
        return detail;
      });
  }

  requestChapterContent(id: string): Promise<string[]> {
    const [mangaId, chapterId] = id.split('/');

    return this.instance
      .post('/twirp/comic.v1.Comic/Index?device=h5&platform=h5', { ep_id: chapterId })
      .then((res) =>
        this.instance.get('https://i0.hdslb.com' + res.data.data, { responseType: 'arraybuffer' })
      )
      .then((res) => parseChapterContent(mangaId, chapterId, res.data))
      .then((json) =>
        this.instance.post('/twirp/comic.v1.Comic/ImageToken?device=h5&platform=h5', {
          urls: JSON.stringify(json.pics),
        })
      )
      .then(async (res) => {
        return res.data.data.map((it: any) => `${it.url}?token=${it.token}`);
      });
  }

  requestImage(url: string): Promise<Buffer> {
    return this.instance.get(url, { responseType: 'arraybuffer' }).then((res) => {
      return res.data;
    });
  }
}
