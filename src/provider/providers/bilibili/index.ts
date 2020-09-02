import axios from 'axios';

import * as Entity from '../../../library/entity';
import { ProviderAdapter } from '../../adapter';
import {
  parseMangaOutlines,
  parseMangaDetail,
  parseChapterContent,
  parseMangaOutlinesAlter,
} from './parse';

export default class Provider extends ProviderAdapter {
  readonly id: string = 'bilibili';
  readonly name: string = '哔哩哔哩漫画';
  readonly lang: string = 'zh';
  readonly isLatestSupport: boolean = true;

  private readonly pageSize = 20;
  private readonly baseUrl = 'https://manga.bilibili.com/twirp/comic.v1.Comic/';
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
      .post('/Search?device=pc&platform=web', {
        key_word: keywords,
        page_num: page,
        page_size: this.pageSize,
      })
      .then((res) => parseMangaOutlines(res.data));
  }

  requestPopular(page: number): Promise<Entity.MangaOutline[]> {
    return this.instance
      .post('/ClassPage?device=pc&platform=web', {
        style_id: -1,
        area_id: -1,
        is_finish: -1,
        order: 0,
        page_num: page,
        page_size: this.pageSize,
        is_free: -1,
      })
      .then((res) => parseMangaOutlinesAlter(res.data));
  }

  requestLatest(page: number): Promise<Entity.MangaOutline[]> {
    return this.instance
      .post('/ClassPage?device=pc&platform=web', {
        style_id: 1013,
        area_id: -1,
        is_finish: -1,
        order: 1,
        page_num: page,
        page_size: this.pageSize,
        is_free: -1,
      })
      .then((res) => parseMangaOutlinesAlter(res.data));
  }

  requestMangaDetail(mangaId: string): Promise<Entity.MangaDetail> {
    return this.instance
      .post('/ComicDetail?device=h5&platform=h5', { comic_id: mangaId })
      .then((res) => parseMangaDetail(res.data.data))
      .then((detail) => {
        detail.providerId = this.id;
        return detail;
      });
  }

  requestChapterContent(mangaId: string, chapterId: string): Promise<string[]> {
    return this.instance
      .post('/Index?device=h5&platform=h5', { ep_id: chapterId })
      .then((res) =>
        this.instance.get('https://i0.hdslb.com' + res.data.data, { responseType: 'arraybuffer' })
      )
      .then((res) => parseChapterContent(mangaId, chapterId, res.data))
      .then((json) =>
        this.instance.post('/ImageToken?device=h5&platform=h5', {
          urls: JSON.stringify(json.pics),
        })
      )
      .then((res) => res.data.data.map((it: any) => `${it.url}?token=${it.token}`));
  }

  requestImage(url: string): Promise<Buffer> {
    return this.instance.get(url, { responseType: 'arraybuffer' }).then((res) => res.data);
  }
}
