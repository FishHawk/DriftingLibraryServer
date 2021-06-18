import axios from 'axios';

export default class Api {
  private readonly baseUrl = 'http://v3api.dmzj.com';

  readonly instance = axios.create({
    baseURL: this.baseUrl,
    timeout: 10000,
    headers: {
      Referer: 'http://www.dmzj.com/',
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/56.0.2924.87 ' +
        'Safari/537.36 ' +
        'Tachiyomi/1.0',
    },
  });

  /**
   * 按关键词搜索
   * @param page - 页数，从0开始
   * @param keywords - 关键词
   */
  search(page: number, keywords: string) {
    keywords = encodeURI(keywords);
    return this.instance.get(`/search/show/0/${keywords}/${page}.json`);
  }

  /**
   * 漫画排行
   * @param page - 页数，从0开始
   * @param type - @see rankType
   * @param range - @see rankRange
   */
  getRank(page: number, type: string, range: string) {
    return this.instance.get(`/rank/0/${range}/${type}/${page}.json`);
  }

  /**
   * 最新更新
   * @param page - 页数，从0开始
   * @param type - @see latestType
   */
  getLatest(page: number, type: string) {
    return this.instance.get(`/latest/${type}/${page}.json`);
  }

  /**
   * 漫画分类
   * @param page - 页数，从0开始
   * @param genre - @see classifyGenre
   * @param status - @see classifyStatus
   * @param area - @see classifyArea
   * @param reader - @see classifyReader
   * @param sort - @see classifySort
   */
  getClassify(
    page: number,
    genre: string,
    reader: string,
    status: string,
    area: string,
    sort: string
  ) {
    let param = [genre, reader, status, area].filter((s) => s !== '').join('-');
    if (param === '') param = '0';
    return this.instance.get(`/classify/${param}/${sort}/${page}.json`);
  }

  /**
   * 获取漫画详情
   * @param comicId - 漫画id
   */
  getComic(comicId: string) {
    return this.instance.get(`/comic/comic_${comicId}.json?version=2.7.019`);
  }

  /**
   * 获取章节详情
   * @param comicId - 漫画id
   * @param chapterId - 章节id
   */
  getChapter(comicId: string, chapterId: string) {
    return this.instance.get(`/chapter/${comicId}/${chapterId}.json`);
  }
}
