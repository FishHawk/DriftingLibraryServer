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

  const mangaId: string = '29075';
  const chapterId: string = '62412';

  it('test request manga detail', () => {
    return provider.requestMangaDetail(mangaId).then((result) => {
      assert.equal(result.metadata.title, '劫火之教典');
    });
  });

  it('test request chapter content', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) => {
      assert.equal(result.length, 35);
    });
  });

  it('test request image', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) =>
      provider.requestImage(result[0]).then((result) => {
        assert.equal(result.length, 103792);
        return saveImageFile(provider.name, result.slice());
      })
    );
  });
});
