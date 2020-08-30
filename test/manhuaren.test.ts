import assert from 'assert';
import Manhuaren from '../src/provider/providers/manhuaren';

describe('Source test: manhuaren', function () {
  const provider = new Manhuaren();
  it('test search', () => {
    return provider.search(1, '龙珠超').then((result) => {
      assert.equal(result[0].metadata.title, '龙珠超');
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
      assert.equal(result.metadata.title, '龙珠超');
    });
  });

  it('test request chapter content', () => {
    return provider.requestChapterContent('1012028').then((result) => {
      assert.equal(result.length, 45);
    });
  });

  it('test request image', () => {
    const url =
      'http://manhua1034-61-174-50-98.cdndm5.com/19/18657/1012028/42_8784.jpg' +
      '?cid=1012028&key=38ff9ebb8af1295c83622280db2bda33&type=1';
    return provider.requestImage(url).then((result) => {
      assert.equal(result.length, 243579);
    });
  });
});
