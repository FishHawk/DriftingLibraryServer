import axios from 'axios';
import cheerio from 'cheerio';

import { MangaOutline } from './models/manga.js';

const instance = axios.create({
  baseURL: 'https://m.manhuadui.com/',
  timeout: 1000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/12.0 Mobile/15A372 Safari/604.1',
  },
});

async function search(keywords, page) {
  return await instance
    .get('/search/', { params: { keywords, page } })
    .then(function (response) {
      const $ = cheerio.load(response.data);
      return $('div.itemBox').map(function (i, el) {
        let outline = new MangaOutline();
        outline.id = $('.itemTxt a', el).first().attr('href').split('/')[4];
        outline.title = $('.itemTxt a', el).first().text();
        outline.thumb = $('.itemImg a img', el).first().attr('src');
        outline.author = $('.txtItme', el).first().text();
        outline.update = $('.itemTxt .txtItme .date', el).first().text();
        return outline;
      });
    })
    .catch(function (error) {
      return [];
    });
}

export { search };
