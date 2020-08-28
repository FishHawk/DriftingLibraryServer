import assert from 'assert';
import Manhuaren from '../src/provider/providers/manhuaren';

describe('Source test: manhuaren', function () {
  const provider = new Manhuaren();
  it('test search', () => {
    return provider.search(1, '龙珠超').then((result) => {
      assert.equal(result[0].title, '龙珠超');
    });
  });

  it('test request popular mangas', () => {
    return provider.requestPopular(1).then((result) => {
      assert.equal(result.length, 20);
    });
  });

  it('test request latest update', () => {
    return provider.requestLatest(1).then((result) => {
      assert.equal(result.length, 20);
    });
  });

  it('test request manga detail', () => {
    return provider.requestMangaDetail('18657').then((result) => {
      assert.equal(result.title, '龙珠超');
    });
  });

  it('test request chapter content', () => {
    return provider.requestChapterContent('1012028').then((result) => {
      assert.equal(result.length, 45);
    });
  });
});
