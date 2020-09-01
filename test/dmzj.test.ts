import assert from 'assert';
import Provider from '../src/provider/providers/dmzj';
import { saveImageFile } from './util';

describe('Provider test: dmzj', function () {
  const provider = new Provider();
  it('test search', () => {
    return provider.search(1, '劫火之教典').then((result) => {
      assert.equal(result[0].metadata.title, '劫火之教典');
    });
  });

  it('test request popular mangas', () => {
    return provider.requestPopular(1).then((result) => {
      assert.equal(result.length, 15);
    });
  });

  it('test request latest update', () => {
    return provider.requestLatest(1).then((result) => {
      assert.equal(result.length, 30);
    });
  });

  it('test request manga detail', () => {
    return provider.requestMangaDetail('29075').then((result) => {
      assert.equal(result.metadata.title, '劫火之教典');
    });
  });

  it('test request chapter content', () => {
    return provider.requestChapterContent('29075/62412').then((result) => {
      assert.equal(result.length, 35);
    });
  });

  it('test request image', () => {
    const url = 'http://imgsmall.dmzj.com/j/29075/62412/0.jpg';
    return provider.requestImage(url).then((result) => {
      assert.equal(result.length, 103792);
      return saveImageFile(provider.name, result);
    });
  });
});
