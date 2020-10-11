import axios from 'axios';

export default class Api {
  private readonly pageSize = 20;
  private readonly baseUrl = 'https://manga.bilibili.com/twirp/comic.v1.Comic/';

  readonly instance = axios.create({
    baseURL: this.baseUrl,
    timeout: 10000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/65.0.3325.146 Safari/537.36',
    },
  });

  /**
   * 按关键词搜索
   * @param page - 页数，从1开始
   * @param keywords - 关键词
   */
  search(page: number, keywords: string) {
    return this.instance.post('/Search?device=pc&platform=web', {
      key_word: keywords,
      page_num: page,
      page_size: this.pageSize,
    });
  }

  /**
   * 漫画排行
   * @param type - @see homeHotType
   */
  getHomeHot(type: number) {
    return this.instance.post('/HomeHot?device=pc&platform=web', { type });
  }

  /**
   * 漫画排行
   * @param type - @see homeFansType
   */
  getHomeFans(type: number) {
    return this.instance.post('/HomeFans?device=pc&platform=web', {
      last_month_offset: 0,
      last_week_offset: 0,
      type,
    });
  }

  /**
   * 每日推送
   * @param page - 页数，从1开始
   * @param date - 日期，例如：'2020-09-23'
   */
  getDailyPush(page: number, date: string) {
    return this.instance.post('/GetDailyPush?device=pc&platform=web', {
      date,
      page_num: page,
      page_size: 10, // 最大为10
    });
  }

  /**
   * 漫画分类
   * @param page - 页数，从1开始
   * @param style - @see classStyle
   * @param area - @see classArea
   * @param isFinish - @see classIsFinish
   * @param isFree - @see classIsFree
   * @param order - @see classOrder
   */
  getClassPage(
    page: number,
    style: number,
    area: number,
    isFinish: number,
    isFree: number,
    order: number
  ) {
    return this.instance.post('/ClassPage?device=pc&platform=web', {
      area_id: area,
      is_finish: isFinish,
      is_free: isFree,
      order: order,
      page_num: page,
      page_size: this.pageSize,
      style_id: style,
    });
  }

  /**
   * 获取漫画详情
   * @param comicId - 漫画id
   */
  getComicDetail(comicId: string) {
    return this.instance.post('/ComicDetail?device=h5&platform=h5', {
      comic_id: comicId,
    });
  }

  /**
   * 获取章节图片token
   * @param chapterId - 章节id
   */
  getChapterIndex(chapterId: string) {
    return this.instance
      .post('/Index?device=h5&platform=h5', { ep_id: chapterId })
      .then((res) =>
        this.instance.get('https://i0.hdslb.com' + res.data.data, {
          responseType: 'arraybuffer',
        })
      );
  }

  /**
   * 获取章节图片token
   * @param pics - 图片url
   */
  getChapterImageToken(pics: string[]) {
    return this.instance.post('/ImageToken?device=h5&platform=h5', {
      urls: JSON.stringify(pics),
    });
  }
}
