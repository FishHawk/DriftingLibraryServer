import assert from 'assert';

import source from '../server/provider/source/manhuaren.js';

describe('Source test: manhuaren', function () {
  it('test search', () => {
    return source.search(1, '龙珠超').then((result) => {
      assert.equal(result[0].title, '龙珠超');
    });
  });

  it('test request popular mangas', () => {
    return source.requestPopularMangas(1).then((result) => {
      assert.equal(result.length, 20);
    });
  });

  it('test request latest update', () => {
    return source.requestLatestUpdate(1).then((result) => {
      assert.equal(result.length, 20);
    });
  });

  it('test request manga detail', () => {
    return source.requestMangaDetail(18657).then((result) => {
      assert.equal(result.title, '龙珠超');
    });
  });

  it('test request chapter content', () => {
    return source.requestChapterContent(1012028).then((result) => {
      assert.equal(result.length, 45);
    });
  });
});
