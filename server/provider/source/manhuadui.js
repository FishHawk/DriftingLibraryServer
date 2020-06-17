import axios from 'axios';
import cheerio from 'cheerio';
import crypto from 'crypto';

import { MangaOutline, MangaDetail, Chapter } from '../models/manga.js';

function correctUrl(url) {
  if (url.startsWith('//')) url = 'https:' + url;
  return url;
}

function decrypt(ciphertext) {
  const key = '123456781234567G';
  const iv = 'ABCDEF1G34123412';

  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let plaintext = decipher.update(ciphertext, 'base64');
  plaintext += decipher.final();
  return plaintext;
}

function correctImageUrl(key, prefix) {
  const domain = 'https://mhcdn.manhuazj.com';
  if (key.match('\\^https?://(images.dmzj.com|imgsmall.dmzj.com)/i') != null) {
    return domain + '/showImage.php?url=' + Buffer.from(key, 'utf-8');
  } else if (key.match('\\^[a-z]//i') != null) {
    return (
      domain +
      '/showImage.php?url=' +
      Buffer.from('https://images.dmzj.com/' + key, 'utf-8')
    );
  }
  if (key.startsWith('http') || key.startsWith('ftp')) return key;
  return domain + '/' + prefix + key;
}

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
      return $('div.itemBox')
        .map(function (i, el) {
          let outline = new MangaOutline();
          outline.id = $('.itemTxt a', el).first().attr('href').split('/')[4];
          outline.title = $('.itemTxt a', el).first().text();
          outline.thumb = $('.itemImg a img', el).first().attr('src');
          outline.author = $('.txtItme', el).first().text();
          outline.update = $('.itemTxt .txtItme .date', el).first().text();
          return outline;
        })
        .toArray();
    })
    .catch(function (error) {
      return [];
    });
}

async function getDetail(mangaId) {
  return await instance
    .get(`/manhua/${mangaId}/`)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      let detail = new MangaDetail();
      detail.id = mangaId;
      detail.title = $('#comicName').first().text();
      detail.thumb = correctUrl($('#Cover img').first().attr('src'));

      const author = $('.Introduct_Sub .sub_r .txtItme')
        .eq(0)
        .contents()
        .eq(2)
        .text();
      detail.addTag('authors', author);

      const status = $('.Introduct_Sub .sub_r .txtItme a').eq(3).text();
      detail.addTag('status', status);

      $('.chapter-warp ul').each(function (i, el) {
        const collection = i.toString();
        $('li a', el).each(function (i, el) {
          let chapter = new Chapter();
          chapter.id = $(this).attr('href').split('/')[3].slice(0, -5);
          chapter.title = $('a span', el).first().text();
          detail.addChapter(collection, chapter);
        });
      });
      return detail;
    })
    .catch(function (error) {
      return;
    });
}

async function getChapter(mangaId, chapterId) {
  return await instance
    .get(`/manhua/${mangaId}/${chapterId}.html`)
    .then(function (response) {
      const $ = cheerio.load(response.data);

      const ciphertext = response.data.match(
        'var chapterImages =\\s*"(.*?)";'
      )[1];
      const plaintext = decrypt(ciphertext);
      let imageList = JSON.parse(plaintext);

      let prefix = response.data.match('var chapterPath = "([\\s\\S]*?)";');
      return imageList.map((i) => correctImageUrl(i, prefix));
    })
    .catch(function (error) {
      return [];
    });
}

export default {
  name: 'manhuadui',
  search,
  getDetail,
  getChapter,
};
