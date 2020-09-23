import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';

export default class Api {
  private readonly pageSize = 20;
  private readonly baseUrl = 'http://mangaapi.manhuaren.com';

  readonly instance = axios.create({
    baseURL: this.baseUrl,
    timeout: 5000,
    headers: {
      Referer: 'http://www.dm5.com/dm5api/',
      clubReferer: 'http://mangaapi.manhuaren.com/',
      'X-Yq-Yqci': '{"le": "zh"}',
      'User-Agent': 'okhttp/3.11.0',
    },
  });

  /**
   * 按关键词搜索
   * @param page - 页数，从0开始
   * @param keywords - 关键词
   */
  getSearchManga(page: number, keywords: string) {
    return this.instance.get('/v1/search/getSearchManga', {
      params: this.addPageParam(page, { keywords }),
    });
  }

  /**
   * 漫画排行
   * @param page - 页数，从0开始
   * @param sortType - @see rankType
   */
  getRank(page: number, sortType: string) {
    return this.instance.get('/v1/manga/getRank', {
      params: this.addPageParam(page, { sortType }),
    });
  }

  /**
   * 最新更新
   * @param page - 页数，从0开始
   */
  getUpdate(page: number) {
    return this.instance.get('/v1/manga/getUpdate', {
      params: this.addPageParam(page),
    });
  }

  /**
   * 最新发布
   * @param page - 页数，从0开始
   */
  getRelease(page: number) {
    return this.instance.get('/v1/manga/getRelease', {
      params: this.addPageParam(page),
    });
  }

  /**
   * 漫画分类
   * @param page - 页数，从0开始
   * @param subCategoryId - @see categoryType
   * @param subCategoryType - @see categoryType
   * @param sort - @see categorySort
   */
  getCategoryMangas(
    page: number,
    subCategoryId: string,
    subCategoryType: string,
    sort: string
  ) {
    return this.instance.get('/v2/manga/getCategoryMangas', {
      params: this.addPageParam(page, { subCategoryId, subCategoryType, sort }),
    });
  }

  /**
   * 获取漫画详情
   * @param mangaId - 漫画id
   */
  getDetail(mangaId: string) {
    return this.instance.get('/v1/manga/getDetail', {
      params: Api.addExtraParam({ mangaId }),
    });
  }

  /**
   * 获取章节详情
   * @param mangaSectionId - 章节id
   */
  getRead(mangaSectionId: string) {
    return this.instance.get('/v1/manga/getRead', {
      params: Api.addExtraParam({
        mangaSectionId,
        netType: 4,
        loadreal: 1,
        imageQuality: 2,
      }),
    });
  }

  private static generateGSNHash(params: any) {
    const c = '4e0a48e1c0b54041bce9c8f0e036124d';
    let s = c + 'GET';

    Object.keys(params)
      .sort()
      .forEach(function (it, i) {
        if (it != 'gsn') {
          s += it;
          s += encodeURIComponent(params[it]).replace('*', '%2A');
        }
      });
    s += c;

    const md5 = crypto.createHash('md5');
    return md5.update(s).digest('hex');
  }

  private static addExtraParam(params: any) {
    params.gsm = 'md5';
    params.gft = 'json';
    params.gts = moment().format('YYYY-MM-DD+HH:mm:ss');
    params.gak = 'android_manhuaren2';
    params.gat = '';
    params.gaui = '191909801';
    params.gui = '191909801';
    params.gut = '0';

    const gsn = Api.generateGSNHash(params);
    params.gsn = gsn;
    return params;
  }

  private addPageParam(page: number, param: any = {}) {
    param.start = (this.pageSize * (page - 1)).toString();
    param.limit = this.pageSize.toString();
    return Api.addExtraParam(param);
  }
}
