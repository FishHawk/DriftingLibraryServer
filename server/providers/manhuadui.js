import axios from 'axios';
import cheerio from 'cheerio';

import { MangaOutline, MangaDetail, Chapter } from './models/manga.js';

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

function correct_url(url) {
  if (url.startsWith('//')) url = 'https:' + url;
  return url;
}

async function get_detail(id) {
  return await instance
    .get('/manhua/' + id + '/')
    .then(function (response) {
      const $ = cheerio.load(response.data);
      let detail = new MangaDetail();
      detail.id = id;
      detail.title = $('#comicName').first().text();
      detail.thumb = correct_url($('#Cover img').first().attr('src'));

      const author = $('.Introduct_Sub .sub_r .txtItme').eq(0).contents().eq(2).text();
      detail.add_tag('authors', author);

      const status = $('.Introduct_Sub .sub_r .txtItme a').eq(3).text();
      detail.add_tag('status', status);
      console.log($('.Introduct_Sub .sub_r .txtItme').eq(0).contents().text())

      $('.chapter-warp ul').each(function (i, el) {
        const collection = i.toString();
        $('li a', el).each(function (i, el) {
          let chapter = new Chapter();
          chapter.id = $(this).attr('href').split('/')[3].slice(0, -5);
          chapter.title = $('a span', el).first().text();
          detail.add_chapter(collection, chapter);
        });
      });
      return detail;
    })
    .catch(function (error) {
      return;
    });
}

export { search, get_detail };
