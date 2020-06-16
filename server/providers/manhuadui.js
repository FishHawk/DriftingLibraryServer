import axios from 'axios';
import cheerio from 'cheerio';
import crypto from 'crypto';

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

async function get_detail(manga_id) {
  return await instance
    .get(`/manhua/${manga_id}/`)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      let detail = new MangaDetail();
      detail.id = manga_id;
      detail.title = $('#comicName').first().text();
      detail.thumb = correct_url($('#Cover img').first().attr('src'));

      const author = $('.Introduct_Sub .sub_r .txtItme')
        .eq(0)
        .contents()
        .eq(2)
        .text();
      detail.add_tag('authors', author);

      const status = $('.Introduct_Sub .sub_r .txtItme a').eq(3).text();
      detail.add_tag('status', status);

      $('.chapter-warp ul').each(function (i, el) {
        const collection = i.toString();
        $('li a', el).each(function (i, el) {
          let chapter = new Chapter();
          chapter.id = $(this).attr('href').split('/')[3].slice(0, -5);
          chapter.title = $('a span', el).first().text();
          detail.add_chapter(collection, chapter);
          console.log(chapter.id);
        });
      });
      return detail;
    })
    .catch(function (error) {
      return;
    });
}
function decrypt(ciphertext) {
  const key = '123456781234567G';
  const iv = 'ABCDEF1G34123412';

  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let plaintext = decipher.update(ciphertext, 'base64');
  plaintext += decipher.final();
  return plaintext;
}

function correct_image_url(key, prefix) {
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

async function get_chapter(manga_id, chapter_id) {
  return await instance
    .get(`/manhua/${manga_id}/${chapter_id}.html`)
    .then(function (response) {
      const $ = cheerio.load(response.data);

      const ciphertext = response.data.match(
        'var chapterImages =\\s*"(.*?)";'
      )[1];
      const plaintext = decrypt(ciphertext);
      let image_list = JSON.parse(plaintext);

      let prefix = response.data.match('var chapterPath = "([\\s\\S]*?)";');
      return image_list.map((i) => correct_image_url(i, prefix));
    });
}

export { search, get_detail, get_chapter };
