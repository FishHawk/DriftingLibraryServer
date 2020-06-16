import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { get_detail, get_chapter } from './manhuadui.js';

async function download_chapter(dir, manga_id, chapter_id) {
  const image_list = await get_chapter(manga_id, chapter_id);

  for (const [i, url] of image_list.entries()) {
    await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    }).then(function (response) {
      response.data.pipe(fs.createWriteStream(`${dir}/${i}.jpg`));
    });
  }
}

export { download_chapter };
