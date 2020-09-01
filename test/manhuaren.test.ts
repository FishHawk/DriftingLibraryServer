import assert from 'assert';
import Provider from '../src/provider/providers/manhuaren';
import { saveImageFile } from './util';

describe('Provider test: manhuaren', function () {
  const provider = new Provider();
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
      'http://manhua1034-101-69-161-98.cdndm5.com/19/18657/1012028/' +
      '1_7696.jpg?cid=1012028&key=9174c2c636d05612834c562370d3e2ea&type=1';
    return provider.requestImage(url).then((result) => {
      assert.equal(result.length, 283001);
      return saveImageFile(provider.name, result);
    });
  });
});
