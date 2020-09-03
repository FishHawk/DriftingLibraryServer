import assert from 'assert';
import Provider from '../../src/provider/providers/bilibili';
import { saveImageFile } from './util';

describe('Provider test: bilibili', function () {
  const provider = new Provider();

  it('test search', () => {
    return provider.search(1, '迷宫饭').then((result) => {
      assert.equal(result[0].metadata.title, '迷宫饭');
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

  const mangaId: string = '28284';
  const chapterId: string = '466261';

  it('test request manga detail', () => {
    return provider.requestMangaDetail(mangaId).then((result) => {
      assert.equal(result.metadata.title, '迷宫饭');
    });
  });

  it('test request chapter content', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) => {
      assert.equal(result.length, 42);
    });
  });

  it('test request image', () => {
    return provider.requestChapterContent(mangaId, chapterId).then((result) =>
      provider.requestImage(result[0]).then((result) => {
        assert.equal(result.length, 2008111);
        return saveImageFile(provider.name, result.slice());
      })
    );
  });
});
